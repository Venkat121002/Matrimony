import ProfileView from './ProfileView.js';

/** MongoDB driver for profile views (same API as ../firestore/profileViews.js). */

// Distinct profile ids this viewer has ever opened.
export const distinctViewedProfileIds = async (viewerId) =>
  (await ProfileView.distinct('viewedProfileId', { viewerId })).map(String);

// Upsert on the unique (viewerId, viewedProfileId, monthYear) index.
export const recordView = (viewerId, viewedProfileId, monthYear, viewedAt = new Date()) =>
  ProfileView.updateOne(
    { viewerId, viewedProfileId, monthYear },
    { $setOnInsert: { viewedAt } },
    { upsert: true }
  );

export const countViewsInMonth = (viewerId, monthYear) => ProfileView.countDocuments({ viewerId, monthYear });

export const deleteViewsForUser = (userId) =>
  ProfileView.deleteMany({ $or: [{ viewerId: userId }, { viewedProfileId: userId }] });
