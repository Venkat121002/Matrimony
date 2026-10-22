import mongoose from 'mongoose';

/**
 * Manual UPI payment requests (QR + screenshot, reviewed by an admin).
 * Records created by the old Cashfree/Razorpay gateways are kept read-only so revenue
 * totals stay correct; their legacy fields are listed at the bottom.
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
      default: 'manual_upi',
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
      enum: ['created', 'pending', 'captured', 'rejected', 'failed'],
      default: 'pending',
      index: true,
    },
    planName: {
      type: String,
      default: 'Premium Annual Membership',
    },
    screenshot: {
      type: String, // stored filename under the private `payments/` folder
    },
    transactionRef: {
      type: String, // optional UPI transaction / UTR id typed by the user
    },
    reviewedAt: {
      type: Date,
    },
    approvedPlanId: {
      type: String,
    },
    approvedDays: {
      type: Number,
    },
    rejectionReason: {
      type: String,
    },
    capturedAt: {
      type: Date,
    },

    // Legacy gateway fields (read-only history)
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
