import mongoose from 'mongoose';

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
    cashfreeOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    cashfreePaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    paymentSessionId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    gateway: {
      type: String,
      default: 'cashfree',
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
      enum: ['created', 'captured', 'failed'],
      default: 'created',
      index: true,
    },
    planName: {
      type: String,
      default: 'Premium Annual Membership',
    },
    receipt: {
      type: String,
    },
    capturedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
