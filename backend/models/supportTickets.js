// Picks the MongoDB (local) or Firestore (production) driver; see config/database.js.
import { isFirestore } from '../config/database.js';

const driver = await import(isFirestore ? './firestore/supportTickets.js' : './mongo/supportTickets.js');

export const {
  createTicket,
  getTicketById,
  findTickets,
  countTickets,
  updateTicket,
  deleteTicketById,
  deleteResolvedTickets,
} = driver;
