import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Firebase Admin bootstrap.
 *
 * On Cloud Functions the project, credentials and bucket come from the runtime.
 * Locally, set GOOGLE_APPLICATION_CREDENTIALS to a service-account key (or run
 * `gcloud auth application-default login`) plus FIREBASE_PROJECT_ID.
 */
if (!getApps().length) {
  if (process.env.FIREBASE_CONFIG) {
    // Cloud Functions runtime: project id + default bucket come from FIREBASE_CONFIG
    initializeApp();
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.firebasestorage.app` : undefined),
    });
  }
}

// Matrimony uses its own named database (FIRESTORE_DATABASE_ID, e.g. `tamil-nikah`),
// separate from the project's (default) database used by other apps.
export const db = process.env.FIRESTORE_DATABASE_ID
  ? getFirestore(process.env.FIRESTORE_DATABASE_ID)
  : getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// STORAGE_BUCKET selects a non-default bucket (prod uses the asia-south1 bucket,
// not the project's US default bucket).
export const bucket = () =>
  process.env.STORAGE_BUCKET ? getStorage().bucket(process.env.STORAGE_BUCKET) : getStorage().bucket();

// Recursively turn Firestore Timestamps back into JS Dates so controllers can
// compare them (e.g. trialExpiresAt < now) and JSON output matches the old API.
const reviveDates = (value) => {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = reviveDates(v);
    return out;
  }
  return value;
};

// Snapshot -> plain object exposing the doc id as `_id` (the frontend relies on `_id`).
export const fromDoc = (snap) => {
  if (!snap || !snap.exists) return null;
  return { _id: snap.id, ...reviveDates(snap.data()) };
};

// Strip `_id` before writing back to Firestore.
export const toData = (obj) => {
  const { _id, id, ...rest } = obj;
  return rest;
};
