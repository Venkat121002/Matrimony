import mongoose from 'mongoose';

/**
 * Zoho Payments orders (orderId = Zoho payments_session_id).
 * Records created by earlier gateways (Cashfree/Razorpay/manual UPI) are kept read-only so
 * revenue totals stay correct; their legacy fields are listed at the bottom.
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    gateway: {
      type: String,
      default: 'zoho',
    },
    planId: {
      type: String, // 'monthly_premium' | 'annual_premium' | 'featured_marquee'
    },
    amount: {
      type: Number,
      required: true, // in paise (e.g. 99900 = Rs. 999)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'pending', 'approved', 'rejected'],
      default: 'created',
      index: true,
    },
    planName: {
      type: String,
      default: 'Premium Annual Membership',
    },
    planType: {
      type: String,
      index: true,
    },
    proofScreenshot: {
      type: String,
    },
    transactionId: {
      type: String,
      sparse: true,
      index: true,
    },
    notes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    userSnapshot: {
      fullName: String,
      nikahId: String,
      phone: String,
      email: String,
      district: String,
    },
    verifiedBy: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    receipt: {
      type: String,
    },
    referenceNumber: {
      type: String,
    },
    expiresAt: {
      type: Date, // plan expiry after this payment was applied
    },
    capturedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },

    // Legacy fields (read-only history): manual UPI, Cashfree, Razorpay
    screenshot: { type: String },
    transactionRef: { type: String },
    reviewedAt: { type: Date },
    approvedPlanId: { type: String },
    approvedDays: { type: Number },
    rejectionReason: { type: String },
    cashfreeOrderId: { type: String },
    cashfreePaymentId: { type: String },
    paymentSessionId: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    receipt: { type: String },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

// Older databases still hold the gateway-era unique indexes on razorpayOrderId / cashfreeOrderId,
// which reject a second record with those fields empty. Drop whatever the schema no longer declares.
Payment.syncIndexes().catch((err) => console.warn('[Payments] Could not sync indexes:', err.message));

export default Payment;
