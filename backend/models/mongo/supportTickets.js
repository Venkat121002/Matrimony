import SupportTicket from './SupportTicket.js';
import { plain, isValidId, toSet } from './common.js';

/** MongoDB driver for support tickets (same API as ../firestore/supportTickets.js). */

export const createTicket = async (fields) => {
  const { userId, ...rest } = fields;
  return plain((await SupportTicket.create(userId ? fields : rest)).toObject());
};

export const getTicketById = async (id) => (isValidId(id) ? plain(await SupportTicket.findById(id).lean()) : null);

export const findTickets = async (status) =>
  plain(await SupportTicket.find(status ? { status } : {}).sort({ createdAt: -1 }).lean());

export const countTickets = (status) => SupportTicket.countDocuments({ status });

export const updateTicket = async (ticket, patch) => {
  const data = toSet(patch);
  await SupportTicket.updateOne({ _id: ticket._id }, { $set: data });
  Object.assign(ticket, data);
  return ticket;
};
