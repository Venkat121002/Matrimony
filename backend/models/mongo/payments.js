import Payment from './Payment.js';
import { plain, toSet } from './common.js';

/** MongoDB driver for payments (same API as ../firestore/payments.js). Amounts in paise. */

export const createPayment = async (fields) => plain((await Payment.create(fields)).toObject());

export const getPaymentByOrderId = async (orderId) => {
  if (!orderId || typeof orderId !== 'string') return null;
  return plain(
    await Payment.findOne({
      $or: [
        { cashfreeOrderId: orderId },
        { orderId: orderId },
        { razorpayOrderId: orderId },
      ],
    }).lean()
  );
};

export const updatePayment = async (payment, patch) => {
  const data = toSet(patch);
  await Payment.updateOne({ _id: payment._id }, { $set: data });
  Object.assign(payment, data);
  return payment;
};

export const getPaymentById = async (id) => {
  if (!id) return null;
  return plain(
    await Payment.findById(id)
      .populate('userId', 'fullName fullNameEn nikahId phone email district photo photos')
      .lean()
  );
};

export const findPayments = async (query = {}) => {
  const docs = await Payment.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName fullNameEn nikahId phone email district photo photos')
    .lean();
  return docs.map(plain);
};

export const totalCapturedPaise = async () => {
  const [agg] = await Payment.aggregate([
    { $match: { status: { $in: ['captured', 'approved'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return agg ? agg.total : 0;
};
