// Picks the MongoDB (local) or Firestore (production) driver; see config/database.js.
import { isFirestore } from '../config/database.js';

const driver = await import(isFirestore ? './firestore/profileViews.js' : './mongo/profileViews.js');

export const { distinctViewedProfileIds, recordView, countViewsInMonth, deleteViewsForUser } = driver;

export const currentMonthYear = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
