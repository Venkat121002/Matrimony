import { AggregateField } from 'firebase-admin/firestore';
import { tenantCol, fromDoc, toData } from '../../config/firebase.js';

/**
 * Firestore `payments` collection, keyed by order id (unique by construction).
 * Amounts are stored in paise (e.g. 99900 = Rs. 999). Documents written by the old
 * Cashfree/Razorpay gateways stay in place (gateway != 'manual_upi') so revenue totals hold.
 */
const paymentsCol = tenantCol('payments');

export const createPayment = async (fields) => {
  const now = new Date();
  const data = { currency: 'INR', status: 'pending', gateway: 'manual_upi', ...fields, createdAt: now, updatedAt: now };
  await paymentsCol.doc(data.orderId).set(data);
  return { _id: data.orderId, ...data };
};

export const getPaymentByOrderId = async (orderId) => {
  if (!orderId || typeof orderId !== 'string' || orderId.includes('/')) return null;
  return fromDoc(await paymentsCol.doc(orderId).get());
};

const byCreatedDesc = (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);

// Manual UPI requests only, newest first.
export const listPayments = async () => {
  const snap = await paymentsCol.orderBy('createdAt', 'desc').limit(500).get();
  return snap.docs.map(fromDoc).filter((p) => p.gateway === 'manual_upi');
};

export const listPaymentsByUser = async (userId) => {
  if (!userId) return [];
  const snap = await paymentsCol.where('userId', '==', String(userId)).get();
  return snap.docs.map(fromDoc).filter((p) => p.gateway === 'manual_upi').sort(byCreatedDesc);
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
