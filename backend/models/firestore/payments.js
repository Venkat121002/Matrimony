import { AggregateField } from 'firebase-admin/firestore';
import { db, fromDoc, toData } from '../../config/firebase.js';

/**
 * Firestore `payments` collection, keyed by Razorpay order id (unique by construction).
 * Amounts are stored in paise (e.g. 99900 = Rs. 999).
 */
const paymentsCol = db.collection('payments');

export const createPayment = async (fields) => {
  const now = new Date();
  const orderId = fields.cashfreeOrderId || fields.orderId || fields.razorpayOrderId;
  const data = { currency: 'INR', status: 'created', planName: 'Premium Annual Membership', gateway: 'cashfree', ...fields, orderId, createdAt: now, updatedAt: now };
  await paymentsCol.doc(orderId).set(data);
  return { _id: orderId, ...data };
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

export const getPaymentById = async (id) => {
  if (!id || typeof id !== 'string' || id.includes('/')) return null;
  return fromDoc(await paymentsCol.doc(id).get());
};

export const findPayments = async (filter = {}) => {
  let query = paymentsCol;
  if (filter.status) {
    query = query.where('status', '==', filter.status);
  }
  const snap = await query.get();
  const list = snap.docs.map(fromDoc);
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return list;
};

export const totalCapturedPaise = async () => {
  const [capturedAgg, approvedAgg] = await Promise.all([
    paymentsCol
      .where('status', '==', 'captured')
      .aggregate({ total: AggregateField.sum('amount') })
      .get()
      .catch(() => ({ data: () => ({ total: 0 }) })),
    paymentsCol
      .where('status', '==', 'approved')
      .aggregate({ total: AggregateField.sum('amount') })
      .get()
      .catch(() => ({ data: () => ({ total: 0 }) })),
  ]);
  return (capturedAgg.data().total || 0) + (approvedAgg.data().total || 0);
};
