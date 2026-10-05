import { AggregateField } from 'firebase-admin/firestore';
import { db, fromDoc, toData } from '../config/firebase.js';

/**
 * Firestore `payments` collection, keyed by Razorpay order id (unique by construction).
 * Amounts are stored in paise (e.g. 99900 = Rs. 999).
 */
const paymentsCol = db.collection('payments');

export const createPayment = async (fields) => {
  const now = new Date();
  const data = { currency: 'INR', status: 'created', planName: 'Premium Annual Membership', ...fields, createdAt: now, updatedAt: now };
  await paymentsCol.doc(fields.razorpayOrderId).set(data);
  return { _id: fields.razorpayOrderId, ...data };
};

export const getPaymentByOrderId = async (orderId) => {
  if (!orderId || typeof orderId !== 'string' || orderId.includes('/')) return null;
  return fromDoc(await paymentsCol.doc(orderId).get());
};

export const updatePayment = async (payment, patch) => {
  const data = { ...toData(patch), updatedAt: new Date() };
  await paymentsCol.doc(payment._id).update(data);
  Object.assign(payment, data);
  return payment;
};

export const totalCapturedPaise = async () => {
  const agg = await paymentsCol
    .where('status', '==', 'captured')
    .aggregate({ total: AggregateField.sum('amount') })
    .get();
  return agg.data().total || 0;
};
