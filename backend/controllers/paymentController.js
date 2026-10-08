import crypto from 'crypto';
import { createPayment, getPaymentByOrderId, updatePayment } from '../models/payments.js';
import { getUserById, updateUser } from '../models/users.js';
import { getSettings } from '../models/settings.js';
import { allowDemoPayments } from '../config/secrets.js';
import { sendPaymentReceiptEmail } from '../services/emailService.js';

// Cashfree Gateway Configuration Helpers
const getCashfreeAppId = () => process.env.CASHFREE_APP_ID || 'TEST11280313ce66e1bc01697be8041e31308211';
const getCashfreeSecretKey = () => process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_APP_ID || 'TEST11280313ce66e1bc01697be8041e31308211';
const getCashfreeEnv = () => (process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox');
const getCashfreeApiVersion = () => process.env.CASHFREE_API_VERSION || '2023-08-01';
const getCashfreeBaseUrl = () =>
  getCashfreeEnv() === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

/**
 * Create Cashfree Payment Order
 * POST /api/payment/create-order
 */
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { planId = 'annual_premium' } = req.body;

    const isMarqueePlan = planId === 'featured_marquee';
    const isMonthlyPlan = planId === 'monthly_premium';
    const settings = await getSettings();

    // Prevent double subscription or double marquee payment
    if (!isMarqueePlan && user.subscriptionStatus === 'premium' && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active Premium Membership subscription.',
        alreadySubscribed: true,
      });
    }

    if (isMarqueePlan && user.isFeatured && user.featuredUntil && new Date(user.featuredUntil) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Your profile is already featured in the Running Marquee Bar.',
        alreadyFeatured: true,
      });
    }

    let priceInRupees;
    let planTitle;

    if (isMarqueePlan) {
      priceInRupees = Number(settings?.featuredMarquee?.price ?? 299);
      planTitle = `Running Bar Profile Promotion (${settings?.featuredMarquee?.durationDays ?? 15} Days)`;
    } else if (isMonthlyPlan) {
      priceInRupees = Number(settings?.monthlySubscriptionPrice ?? 199);
      planTitle = 'Monthly Premium Membership (30 Days Unlimited)';
    } else {
      priceInRupees = Number(settings?.subscriptionPrice ?? 999);
      planTitle = 'Annual Premium Membership (1 Year Unlimited)';
    }

    const amountInPaise = priceInRupees * 100;
    const receipt = `rcpt_${user.nikahId || 'usr'}_${Date.now()}`;
    const orderId = `cf_ord_${(user.nikahId || 'usr').toLowerCase()}_${Date.now().toString(36)}`;

    // Prepare clean customer details for Cashfree PG
    const cleanPhone = (user.phone || '9999999999').replace(/[^0-9]/g, '').slice(-10).padStart(10, '9');
    const customerId = String(user._id || user.nikahId || 'user_' + Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 45);

    const appId = getCashfreeAppId();
    const secretKey = getCashfreeSecretKey();
    const apiVersion = getCashfreeApiVersion();
    const baseUrl = getCashfreeBaseUrl();

    let orderData;

    try {
      const cfResponse = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': apiVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: priceInRupees,
          order_currency: 'INR',
          customer_details: {
            customer_id: customerId,
            customer_name: user.fullName || 'User',
            customer_email: user.email || 'user@tamilnikah.com',
            customer_phone: cleanPhone,
          },
          order_meta: {
            return_url: `${req.headers.origin || 'http://localhost:5173'}/?order_id={order_id}`,
            payment_methods: 'cc,dc,upi,nb',
          },
          order_note: planTitle,
        }),
      });

      const cfJson = await cfResponse.json();

      if (!cfResponse.ok || !cfJson.payment_session_id) {
        throw new Error(cfJson.message || `Cashfree API returned ${cfResponse.status}`);
      }

      orderData = {
        orderId: cfJson.order_id,
        paymentSessionId: cfJson.payment_session_id,
        amount: cfJson.order_amount,
        currency: cfJson.order_currency || 'INR',
      };
    } catch (cfErr) {
      console.error('[Cashfree Gateway Error]:', cfErr.message);
      return res.status(502).json({
        success: false,
        message: 'Could not connect to Cashfree payment gateway. Please check gateway credentials or try again later.',
      });
    }

    // Persist Payment record
    await createPayment({
      userId: user._id,
      orderId: orderData.orderId,
      cashfreeOrderId: orderData.orderId,
      paymentSessionId: orderData.paymentSessionId,
      razorpayOrderId: orderData.orderId, // backward-compat with any legacy queries
      gateway: 'cashfree',
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
      planName: planTitle,
      receipt,
    });

    res.json({
      success: true,
      orderId: orderData.orderId,
      paymentSessionId: orderData.paymentSessionId,
      amount: amountInPaise,
      amountInRupees: priceInRupees,
      currency: 'INR',
      appId,
      environment: getCashfreeEnv(),
      planId,
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
 * Verify Cashfree Payment (Client Callback Endpoint)
 * POST /api/payment/verify-payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      order_id,
      cashfreeOrderId,
      razorpayOrderId,
      paymentId,
      payment_id,
      razorpayPaymentId,
      paymentSessionId,
    } = req.body;

    const user = req.user;
    const targetOrderId = orderId || order_id || cashfreeOrderId || razorpayOrderId;

    if (!targetOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required for verification.',
      });
    }

    const payment = await getPaymentByOrderId(targetOrderId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order record not found.',
      });
    }

    if (payment && payment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized payment verification attempt.',
      });
    }

    let isAuthentic = false;
    let verifiedPaymentId = paymentId || payment_id || razorpayPaymentId || `cf_pay_${Date.now()}`;

    // Query Cashfree Server-to-Server Order Status
    const appId = getCashfreeAppId();
    const secretKey = getCashfreeSecretKey();
    const apiVersion = getCashfreeApiVersion();
    const baseUrl = getCashfreeBaseUrl();

    try {
      const cfCheck = await fetch(`${baseUrl}/orders/${encodeURIComponent(targetOrderId)}`, {
        method: 'GET',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': apiVersion,
        },
      });

      if (cfCheck.ok) {
        const cfOrder = await cfCheck.json();
        if (cfOrder.order_status === 'PAID') {
          isAuthentic = true;
          if (cfOrder.cf_order_id) {
            verifiedPaymentId = String(cfOrder.cf_order_id);
          }
        }
      }
    } catch (checkErr) {
      console.error('[Cashfree Verification Check Exception]:', checkErr.message);
    }

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Transaction not completed or unpaid on Cashfree.',
      });
    }

    // Update payment record
    if (payment) {
      await updatePayment(payment, {
        paymentId: verifiedPaymentId,
        cashfreePaymentId: verifiedPaymentId,
        razorpayPaymentId: verifiedPaymentId,
        status: 'captured',
        capturedAt: new Date(),
      });
    }

    const isMarqueeOrder =
      payment?.planName?.includes('Running Bar') ||
      payment?.planName?.includes('featured_marquee');

    if (isMarqueeOrder) {
      const settings = await getSettings();
      const durationDays = Number(settings?.featuredMarquee?.durationDays || 15);
      const featuredUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      await updateUser(user, {
        isFeatured: true,
        featuredUntil,
      });

      return res.json({
        success: true,
        message: 'Alhamdulillah! Payment verified and your profile is now featured in the Running Marquee Bar!',
        isFeatured: true,
        featuredUntil,
        user,
      });
    }

    // Check if monthly or annual plan
    const isMonthlyPlan =
      payment?.planName?.includes('Monthly') ||
      payment?.planName?.includes('30 Days');

    const durationDays = isMonthlyPlan ? 30 : 365;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await updateUser(user, {
      subscriptionStatus: 'premium',
      subscriptionPlan: isMonthlyPlan ? 'monthly' : 'annual',
      premiumExpiresAt: expiresAt,
      monthlyViewsCount: 0,
    });

    // Trigger transactional payment confirmation email
    sendPaymentReceiptEmail(user, payment || {
      amount: 99900,
      orderId: targetOrderId,
      cashfreeOrderId: targetOrderId,
      paymentId: verifiedPaymentId,
      planName: 'Annual Premium Membership',
    }).catch((err) => console.error('[Email Worker] Payment receipt error:', err.message));

    res.json({
      success: true,
      message: 'Alhamdulillah! Payment verified and Premium membership activated successfully via Cashfree.',
      subscriptionStatus: user.subscriptionStatus,
      premiumExpiresAt: user.premiumExpiresAt,
      user,
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
 * Cashfree & Legacy Webhook Handler
 * POST /api/webhooks/cashfree & POST /api/webhooks/razorpay
 */
export const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body)));
    const payload = Buffer.isBuffer(req.body) || typeof req.body === 'string' ? JSON.parse(rawBody.toString()) : req.body;

    // Cashfree Webhook format
    if (payload?.type === 'PAYMENT_SUCCESS_WEBHOOK' || payload?.data?.payment?.payment_status === 'SUCCESS') {
      const orderId = payload.data?.order?.order_id;
      const paymentId = payload.data?.payment?.cf_payment_id || payload.data?.payment?.payment_id;

      if (orderId) {
        const payment = await getPaymentByOrderId(orderId);
        if (payment) {
          await updatePayment(payment, {
            paymentId: String(paymentId),
            cashfreePaymentId: String(paymentId),
            status: 'captured',
            capturedAt: new Date(),
          });

          const user = await getUserById(payment.userId);
          if (user) {
            const isMarquee = payment?.planName?.includes('Running Bar') || payment?.planName?.includes('featured_marquee');
            if (isMarquee) {
              const settings = await getSettings();
              const durationDays = Number(settings?.featuredMarquee?.durationDays || 15);
              await updateUser(user, {
                isFeatured: true,
                featuredUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              });
            } else {
              await updateUser(user, {
                subscriptionStatus: 'premium',
                premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                monthlyViewsCount: 0,
              });
              sendPaymentReceiptEmail(user, payment).catch(console.error);
            }
          }
        }
      }
      return res.json({ status: 'ok' });
    }

    // Legacy Razorpay Webhook format
    if (payload?.event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

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
      return res.json({ status: 'ok' });
    }

    res.json({ status: 'ignored' });
  } catch (err) {
    console.error('[Webhook Error]:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
};
