// Picks the MongoDB (local) or Firestore (production) driver; see config/database.js.
import { isFirestore } from '../config/database.js';

const driver = await import(isFirestore ? './firestore/users.js' : './mongo/users.js');

export const {
  nextNikahId,
  createUser,
  getUserById,
  findUserByNikahId,
  findUserByIdOrNikahId,
  findUserByIdentifiers,
  comparePassword,
  updateUser,
  deleteUserById,
  addToShortlist,
  removeFromShortlist,
  getUsersByIds,
  findUsers,
  countUsers,
} = driver;

// Mirrors the old `checkTrialStatus()` instance method (in-memory only).
export const checkTrialStatus = (user) => {
  if (user.subscriptionStatus === 'free_trial' && user.trialExpiresAt < new Date()) {
    user.subscriptionStatus = 'expired';
  }
  return user.subscriptionStatus;
};

export const byCreatedDesc = (a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0);
