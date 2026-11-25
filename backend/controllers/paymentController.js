import crypto from 'crypto';
import { createPayment, getPaymentByOrderId, updatePayment, findPayments } from '../models/payments.js';
import { getUserById, updateUser } from '../models/users.js';
import { getSettings } from '../models/settings.js';
import { resolvePlan, applyPlanToUser, isPremiumActive, isFeaturedActive } from '../services/subscriptionService.js';
import {
  isZohoConfigured,
  widgetConfig,
  createPaymentSession,
  getPaymentSession,
  succeededPayment,
  verifyWebhookSignature,
} from '../services/zohoPayments.js';
import { sendPaymentReceiptEmail } from '../services/emailService.js';

/**
 * Activate the plan for a Zoho payment exactly once.
 * Only called after Zoho itself (Retrieve Session API or a signed webhook) reported success.
 * Returns { applied, payment, expiresAt? }.
 */
const capturePayment = async (payment, zohoPaymentId) => {
  if (!(await claimPaymentForCapture(payment.orderId))) {
    // Someone else (webhook vs. browser confirmation) already handled it.
    return { applied: false, payment: await getPaymentByOrderId(payment.orderId) };
  }
  try {
    const user = await getUserById(String(payment.userId));
    if (!user) throw new Error(`Member ${payment.userId} no longer exists`);
    const plan = resolvePlan(payment.planId, await getSettings());
    if (!plan) throw new Error(`Unknown plan ${payment.planId}`);

    const expiresAt = await applyPlanToUser(user, plan, plan.days);
    await updatePayment(payment, {
      status: 'captured',
      zohoPaymentId: zohoPaymentId || '',
      capturedAt: new Date(),
      expiresAt,
    });

    sendPaymentReceiptEmail(user, { ...payment, planName: plan.title, expiresAt }).catch((err) =>
      console.error('[Email Worker] Payment receipt error:', err.message)
    );
    return { applied: true, payment, user, expiresAt };
  } catch (err) {
    // Release the claim so a retry (webhook redelivery / member refresh) can finish the job.
    await updatePayment(payment, { status: 'failed', failureReason: err.message.slice(0, 300) }).catch(() => {});
    throw err;
  }
};

// Zoho reports amounts in rupees ("999.00"); we store paise.
const amountMatches = (payment, zohoAmount) => Math.round(Number(zohoAmount) * 100) === payment.amount;

/**
 * Start a Zoho Payments checkout for a plan.
 * POST /api/payment/create-session   body: { planId }
 */
export const createSession = async (req, res) => {
  try {
    const user = req.user;
    if (!isZohoConfigured()) {
      return res.status(503).json({ success: false, message: 'Online payments are not available right now. Please try again later.' });
    }

    const plan = resolvePlan(req.body.planId, await getSettings());
    if (!plan || !(plan.priceInRupees > 0)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid plan.' });
    }
    if (plan.kind === 'premium' && isPremiumActive(user)) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active Premium Membership subscription.',
        alreadySubscribed: true,
      });
    }
    if (plan.kind === 'marquee' && isFeaturedActive(user)) {
      return res.status(400).json({
        success: false,
        message: 'Your profile is already featured in the Running Marquee Bar.',
        alreadyFeatured: true,
      });
    }

    const referenceNumber = `TMN-${user.nikahId}-${Date.now().toString(36)}`.toUpperCase();
    const session = await createPaymentSession({
      amountInRupees: plan.priceInRupees,
      description: plan.title,
      referenceNumber,
      metaData: { userId: user._id, nikahId: user.nikahId, planId: plan.planId },
    });

    await createPayment({
      orderId: session.payments_session_id,
      userId: String(user._id),
      gateway: 'zoho',
      planId: plan.planId,
      planName: plan.title,
      amount: Math.round(plan.priceInRupees * 100),
      currency: 'INR',
      status: 'created',
      referenceNumber,
    });

    const { accountId, apiKey } = widgetConfig();
    res.json({
      success: true,
      paymentsSessionId: session.payments_session_id,
      amount: plan.priceInRupees,
      currency: 'INR',
      description: plan.title,
      referenceNumber,
      accountId,
      apiKey,
      prefill: {
        name: user.fullNameEn || user.fullName || '',
        // Placeholder logins (no real email) end in these domains — don't prefill them
        email: user.email && !/@(tamilnikah\.com|matrimony\.)/i.test(String(user.email)) ? user.email : '',
        phone: user.phone || '',
      },
    });
  } catch (err) {
    console.error('[Zoho Create Session Error]:', err.message, err.zoho || '');
    // Zoho account not yet activated for collections (KYC/activation pending on Zoho's side)
    if (err.zoho?.code === 'payments_not_enabled') {
      return res.status(503).json({
        success: false,
        message: 'Online payments are being activated and will be available soon. Please try again later.',
      });
    }
    res.status(502).json({ success: false, message: 'Could not start the payment. Please try again.' });
  }
};

/**
 * Called by the browser after the Zoho widget reports success. Never trusts the browser:
 * the session status is re-read from Zoho before the plan is activated.
 * POST /api/payment/confirm   body: { paymentsSessionId }
 */
export const confirmPayment = async (req, res) => {
  try {
    const sessionId = String(req.body.paymentsSessionId || '');
    const payment = await getPaymentByOrderId(sessionId);
    if (!payment || payment.gateway !== 'zoho' || String(payment.userId) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    if (payment.status !== 'captured') {
      const session = await getPaymentSession(sessionId);
      const paid = succeededPayment(session);
      if (!paid || !amountMatches(payment, session.amount)) {
        return res.status(402).json({
          success: false,
          pending: !paid,
          message: paid
            ? 'Payment amount did not match. Please contact support.'
            : 'We could not confirm your payment yet. If money was debited, your plan will activate automatically within a few minutes.',
        });
      }
      await capturePayment(payment, paid.payment_id);
    }

    const fresh = await getPaymentByOrderId(sessionId);
    const user = await getUserById(String(req.user._id));
    res.json({
      success: fresh?.status === 'captured',
      message: 'Payment successful! Your plan is now active.',
      planId: fresh?.planId,
      expiresAt: fresh?.expiresAt || null,
      user,
    });
  } catch (err) {
    console.error('[Zoho Confirm Error]:', err.message, err.zoho || '');
    res.status(502).json({
      success: false,
      message: 'We could not confirm your payment right now. If money was debited, your plan will activate automatically.',
    });
  }
};

/**
 * Zoho Payments webhook (payment.succeeded / payment.failed).
 * POST /api/payment/zoho/webhook  — mounted with a raw body parser in app.js.
 */
export const zohoWebhook = async (req, res) => {
  const rawBody = req.rawBody || req.body;
  if (!verifyWebhookSignature(rawBody, req.headers['x-zoho-webhook-signature'])) {
    console.warn('[Zoho Webhook] Rejected: invalid signature');
    return res.status(401).json({ success: false });
  }

  let event;
  try {
    event = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));
  } catch {
    return res.status(400).json({ success: false });
  }

  try {
    const zp = event?.event_object?.payment;
    const payment = zp?.payments_session_id ? await getPaymentByOrderId(String(zp.payments_session_id)) : null;
    if (!payment || payment.gateway !== 'zoho') {
      // Not one of ours (e.g. a payment link) — acknowledge so Zoho stops retrying.
      return res.json({ success: true, ignored: true });
    }

    if (event.event_type === 'payment.succeeded' && payment.status !== 'captured') {
      // Re-read from Zoho rather than trusting the event body alone.
      const session = await getPaymentSession(payment.orderId);
      const paid = succeededPayment(session);
      if (paid && amountMatches(payment, session.amount)) {
        await capturePayment(payment, paid.payment_id);
      } else {
        console.warn(`[Zoho Webhook] ${payment.orderId}: success event but session not succeeded/amount mismatch`);
      }
    } else if (event.event_type === 'payment.failed' && payment.status === 'created') {
      await updatePayment(payment, { status: 'failed', failureReason: 'Payment failed at Zoho' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[Zoho Webhook Error]:', err.message);
    // 5xx makes Zoho redeliver later.
    res.status(500).json({ success: false });
  }
};

/**
 * Submit Manual Payment Proof with Screenshot
 * POST /api/payment/submit-proof
 */
export const submitPaymentProof = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please log in to submit payment proof.' });
    }

    if (!req.file || !req.file.filename) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot proof is mandatory. Please upload a clear screenshot of your UPI payment.',
      });
    }

    const { planId = 'annual_subscription', amount, transactionId = '', notes = '' } = req.body;

    const isMarqueePlan = planId === 'featured_marquee' || planId === 'featured_profile';
    const isMonthlyPlan = planId === 'monthly_subscription' || planId === 'monthly_premium';
    const settings = await getSettings();

    let priceInRupees;
    let planTitle;
    let planType;

    if (isMarqueePlan) {
      priceInRupees = Number(amount) || Number(settings?.featuredMarquee?.price ?? 299);
      planTitle = `Running Bar Profile Promotion (${settings?.featuredMarquee?.durationDays ?? 15} Days)`;
      planType = 'featured_marquee';
    } else if (isMonthlyPlan) {
      priceInRupees = Number(amount) || Number(settings?.monthlySubscriptionPrice ?? 199);
      planTitle = 'Monthly Premium Membership (30 Days Unlimited)';
      planType = 'monthly_subscription';
    } else {
      priceInRupees = Number(amount) || Number(settings?.subscriptionPrice ?? 999);
      planTitle = 'Annual Premium Membership (1 Year Unlimited)';
      planType = 'annual_subscription';
    }

    const amountInPaise = Math.round(priceInRupees * 100);
    const orderId = `proof_ord_${(user.nikahId || 'usr').toLowerCase()}_${Date.now().toString(36)}`;
    const proofScreenshotUrl = `/uploads/media/${req.file.filename}`;

    const payment = await createPayment({
      userId: user._id,
      orderId,
      gateway: 'manual_qr',
      amount: amountInPaise,
      currency: 'INR',
      status: 'pending',
      planName: planTitle,
      planType,
      proofScreenshot: proofScreenshotUrl,
      transactionId: String(transactionId || '').trim(),
      notes: String(notes || '').trim(),
      userSnapshot: {
        fullName: user.fullName,
        nikahId: user.nikahId,
        phone: user.phone,
        email: user.email,
        district: user.district,
      },
      receipt: `rcpt_proof_${Date.now()}`,
    });

    res.json({
      success: true,
      message: 'Alhamdulillah! Payment proof submitted successfully. Admin will verify and activate your feature shortly.',
      payment,
      orderId,
      planTitle,
      amount: priceInRupees,
    });
  } catch (err) {
    console.error('[Submit Payment Proof Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit payment proof.',
    });
  }
};

/**
 * Get current user's submitted payment proofs
 * GET /api/payment/my-proofs
 */
export const getUserPaymentProofs = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const payments = await findPayments({ userId: user._id });
    const proofs = payments.filter((p) => p.gateway === 'manual_qr' || p.proofScreenshot);

    res.json({
      success: true,
      proofs,
      latestPendingProof: proofs.find((p) => p.status === 'pending') || null,
    });
  } catch (err) {
    console.error('[Get User Proofs Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment proofs.',
    });
  }
};
