import { AggregateField } from 'firebase-admin/firestore';
import { db, tenantCol, fromDoc, toData } from '../../config/firebase.js';

/**
 * Firestore `payments` collection, keyed by order id (for Zoho: the payments_session_id).
 * Amounts are stored in paise (e.g. 99900 = Rs. 999). Records from earlier gateways
 * (Cashfree/Razorpay/manual UPI) stay in place so revenue totals hold.
 */
const paymentsCol = tenantCol('payments');

export const createPayment = async (fields) => {
  const now = new Date();
  const data = { currency: 'INR', status: 'created', gateway: 'zoho', ...fields, createdAt: now, updatedAt: now };
  await paymentsCol.doc(data.orderId).set(data);
  return { _id: data.orderId, ...data };
};

export const getPaymentByOrderId = async (orderId) => {
  if (!orderId || typeof orderId !== 'string' || orderId.includes('/')) return null;
  return fromDoc(await paymentsCol.doc(orderId).get());
};

const byCreatedDesc = (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);

export const listPaymentsByUser = async (userId) => {
  if (!userId) return [];
  const snap = await paymentsCol.where('userId', '==', String(userId)).get();
  return snap.docs.map(fromDoc).sort(byCreatedDesc);
};

/**
 * Atomically move a payment from created/failed to 'processing'. Returns true only for
 * the caller that won, so the browser confirmation and the webhook can't both apply the plan.
 */
export const claimPaymentForCapture = async (orderId) => {
  const ref = paymentsCol.doc(orderId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || !['created', 'failed'].includes(snap.get('status'))) return false;
    tx.update(ref, { status: 'processing', updatedAt: new Date() });
    return true;
  });
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
