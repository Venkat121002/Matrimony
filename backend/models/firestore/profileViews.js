import { db } from '../../config/firebase.js';

/**
 * Firestore `profileViews` collection. Doc id = viewer_viewed_month, which enforces
 * the old unique (viewerId, viewedProfileId, monthYear) index.
 */
const viewsCol = db.collection('profileViews');

// Distinct profile ids this viewer has ever opened.
export const distinctViewedProfileIds = async (viewerId) => {
  const snap = await viewsCol.where('viewerId', '==', viewerId).select('viewedProfileId').get();
  return [...new Set(snap.docs.map((d) => d.get('viewedProfileId')))];
};

export const recordView = (viewerId, viewedProfileId, monthYear, viewedAt = new Date()) =>
  viewsCol
    .doc(`${viewerId}_${viewedProfileId}_${monthYear}`)
    .set({ viewerId, viewedProfileId, monthYear, viewedAt, createdAt: viewedAt, updatedAt: viewedAt });

export const countViewsInMonth = async (viewerId, monthYear) => {
  const agg = await viewsCol.where('viewerId', '==', viewerId).where('monthYear', '==', monthYear).count().get();
  return agg.data().count;
};

// Clean up a deleted user's view history (both directions).
export const deleteViewsForUser = async (userId) => {
  const [asViewer, asViewed] = await Promise.all([
    viewsCol.where('viewerId', '==', userId).get(),
    viewsCol.where('viewedProfileId', '==', userId).get(),
  ]);
  const writer = db.bulkWriter();
  [...asViewer.docs, ...asViewed.docs].forEach((d) => writer.delete(d.ref));
  await writer.close();
};
