import { db, fromDoc, toData } from '../../config/firebase.js';

/** Firestore `supportTickets` collection. */
const ticketsCol = db.collection('supportTickets');

export const createTicket = async (fields) => {
  const now = new Date();
  const data = { status: 'open', adminResponse: '', ...fields, createdAt: now, updatedAt: now };
  const ref = await ticketsCol.add(data);
  return { _id: ref.id, ...data };
};

export const getTicketById = async (id) => {
  if (!id || typeof id !== 'string' || id.includes('/')) return null;
  return fromDoc(await ticketsCol.doc(id).get());
};

export const findTickets = async (status) => {
  const q = status ? ticketsCol.where('status', '==', status) : ticketsCol;
  const snap = await q.get();
  return snap.docs
    .map(fromDoc)
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
};

export const countTickets = async (status) => {
  const agg = await ticketsCol.where('status', '==', status).count().get();
  return agg.data().count;
};

export const updateTicket = async (ticket, patch) => {
  const data = { ...toData(patch), updatedAt: new Date() };
  await ticketsCol.doc(ticket._id).update(data);
  Object.assign(ticket, data);
  return ticket;
};

export const deleteTicketById = async (id) => {
  if (!id || typeof id !== 'string' || id.includes('/')) return false;
  await ticketsCol.doc(id).delete();
  return true;
};

export const deleteResolvedTickets = async () => {
  const snap = await ticketsCol.where('status', '==', 'resolved').get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
};
