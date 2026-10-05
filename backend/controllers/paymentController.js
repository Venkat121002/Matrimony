import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createPayment, getPaymentByOrderId, updatePayment } from '../models/payments.js';
import { getUserById, updateUser } from '../models/users.js';
import { allowDemoPayments } from '../config/secrets.js';
import { sendPaymentReceiptEmail } from '../services/emailService.js';

// Initialize Razorpay SDK instance
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_tamilnikah';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_tamilnikah_secret';
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { planId = 'annual_premium' } = req.body;

    // Plan pricing: ₹999 for 1-Year Premium Access (Amount in paise: 999 * 100 = 99900)
    const amountInPaise = 99900;
    const receipt = `rcpt_${user.nikahId}_${Date.now()}`;

    const razorpay = getRazorpayInstance();

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          userId: user._id.toString(),
          nikahId: user.nikahId,
          plan: 'Annual Premium Membership',
        },
      });
    } catch (sdkErr) {
      // In production a Razorpay failure is a real error, never a fake order.
      if (!allowDemoPayments()) throw sdkErr;
      // If Razorpay test credentials fail or offline mock mode is active:
      console.warn('[Razorpay SDK Warning]: Creating simulated order for development testing:', sdkErr.message);
      order = {
        id: `order_${Math.random().toString(36).substring(2, 15)}`,
        entity: 'order',
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        status: 'created',
      };
    }

    // Persist Payment record
    await createPayment({
      userId: user._id,
      razorpayOrderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
      planName: 'Annual Premium Membership (1 Year Unlimited)',
      receipt,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_tamilnikah',
      user: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order.',
    });
  }
};

/**
 * Verify Razorpay Payment (Client Callback Endpoint)
 * POST /api/payment/verify-payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const user = req.user;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_tamilnikah_secret';

    // Verify HMAC SHA256 Signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic =
      expectedSignature === razorpaySignature ||
      (allowDemoPayments() && razorpaySignature === 'demo_verified_signature'); // Demo bypass (dev only)

    // The order must exist and belong to this user, otherwise any signed order could upgrade anyone.
    const payment = await getPaymentByOrderId(razorpayOrderId);

    if (!isAuthentic || (payment && payment.userId !== user._id) || (!payment && !allowDemoPayments())) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid transaction signature.',
      });
    }

    // Update payment record
    if (payment) {
      await updatePayment(payment, {
        razorpayPaymentId,
        razorpaySignature,
        status: 'captured',
        capturedAt: new Date(),
      });
    }

    // Upgrade User to Premium
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await updateUser(user, {
      subscriptionStatus: 'premium',
      premiumExpiresAt: oneYearFromNow,
      monthlyViewsCount: 0, // Reset view limits to enable unlimited access
    });

    // Trigger transactional payment confirmation email
    sendPaymentReceiptEmail(user, payment || {
      amount: 99900,
      razorpayOrderId,
      razorpayPaymentId,
      planName: 'Annual Premium Membership',
    }).catch((err) => console.error('[Email Worker] Payment receipt error:', err.message));

    const userJson = user;

    res.json({
      success: true,
      message: 'Alhamdulillah! Payment verified and Premium membership activated successfully.',
      subscriptionStatus: user.subscriptionStatus,
      premiumExpiresAt: user.premiumExpiresAt,
      user: userJson,
    });
  } catch (err) {
    console.error('[Verify Payment Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment.',
    });
  }
};

/**
 * Secure Razorpay Webhook Handler
 * POST /api/webhooks/razorpay
 */
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(503).json({ error: 'Webhook secret not configured' });
    }
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    // Cloud Functions exposes the exact bytes as req.rawBody; locally express.raw gives a Buffer.
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Webhook Warning]: Invalid webhook signature received.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = Buffer.isBuffer(req.body) || typeof req.body === 'string' ? JSON.parse(req.body.toString()) : req.body;

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await getPaymentByOrderId(orderId);
      if (payment) {
        await updatePayment(payment, { razorpayPaymentId: paymentId, status: 'captured', capturedAt: new Date() });

        const user = await getUserById(payment.userId);
        if (user) {
          await updateUser(user, {
            subscriptionStatus: 'premium',
            premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            monthlyViewsCount: 0,
          });

          sendPaymentReceiptEmail(user, payment).catch(console.error);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Webhook Error]:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};
