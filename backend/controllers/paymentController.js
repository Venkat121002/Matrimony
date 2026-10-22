import { createPayment, listPaymentsByUser } from '../models/payments.js';
import { getSettings } from '../models/settings.js';
import { deleteStoredFile } from '../middleware/uploadMiddleware.js';
import { resolvePlan, isPremiumActive, isFeaturedActive } from '../services/subscriptionService.js';

// What a member may see about their own request (never the stored screenshot filename).
const publicRequest = (p) => ({
  orderId: p.orderId,
  planId: p.planId,
  planName: p.planName,
  amount: p.amount,
  status: p.status,
  rejectionReason: p.rejectionReason || '',
  createdAt: p.createdAt,
  reviewedAt: p.reviewedAt || null,
});

const discardUpload = (file) => {
  if (file?.filename) deleteStoredFile('payments', file.filename).catch(() => {});
};

/**
 * Member submits a GPay/UPI payment screenshot for an admin to review.
 * POST /api/payment/submit-proof  (multipart: screenshot, planId, transactionRef?)
 */
export const submitPaymentProof = async (req, res) => {
  const user = req.user;
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload your payment screenshot.' });
    }

    const settings = await getSettings();
    const plan = resolvePlan(req.body.planId, settings);
    if (!plan) {
      discardUpload(file);
      return res.status(400).json({ success: false, message: 'Please choose a valid plan.' });
    }

    if (plan.kind === 'premium' && isPremiumActive(user)) {
      discardUpload(file);
      return res.status(400).json({
        success: false,
        message: 'You already have an active Premium Membership subscription.',
        alreadySubscribed: true,
      });
    }

    if (plan.kind === 'marquee' && isFeaturedActive(user)) {
      discardUpload(file);
      return res.status(400).json({
        success: false,
        message: 'Your profile is already featured in the Running Marquee Bar.',
        alreadyFeatured: true,
      });
    }

    // One open request per kind of purchase, so the admin never sees duplicates.
    const existing = await listPaymentsByUser(user._id);
    const hasPending = existing.some((p) => p.status === 'pending' && resolvePlan(p.planId, settings)?.kind === plan.kind);
    if (hasPending) {
      discardUpload(file);
      return res.status(409).json({
        success: false,
        message: 'Your previous payment screenshot is still waiting for admin review.',
        alreadyPending: true,
      });
    }

    const payment = await createPayment({
      userId: user._id,
      orderId: `man_${String(user.nikahId || 'usr').toLowerCase()}_${Date.now().toString(36)}`,
      gateway: 'manual_upi',
      planId: plan.planId,
      planName: plan.title,
      amount: Math.round(plan.priceInRupees * 100),
      currency: 'INR',
      status: 'pending',
      screenshot: file.filename,
      transactionRef: String(req.body.transactionRef || '').trim().slice(0, 60),
    });

    res.status(201).json({
      success: true,
      message: 'Screenshot received. Our team will verify your payment and activate your plan shortly.',
      request: publicRequest(payment),
    });
  } catch (err) {
    discardUpload(file);
    console.error('[Submit Payment Proof Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to submit payment screenshot.' });
  }
};

/**
 * The signed-in member's own payment requests (status / rejection reason).
 * GET /api/payment/my-requests
 */
export const getMyPaymentRequests = async (req, res) => {
  try {
    const requests = (await listPaymentsByUser(req.user._id)).slice(0, 10).map(publicRequest);
    res.json({ success: true, requests });
  } catch (err) {
    console.error('[My Payment Requests Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to load your payment requests.' });
  }
};
