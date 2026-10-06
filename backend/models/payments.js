// Picks the MongoDB (local) or Firestore (production) driver; see config/database.js.
import { isFirestore } from '../config/database.js';

const driver = await import(isFirestore ? './firestore/payments.js' : './mongo/payments.js');

export const { createPayment, getPaymentByOrderId, updatePayment, totalCapturedPaise } = driver;
