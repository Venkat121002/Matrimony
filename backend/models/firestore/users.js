import bcrypt from 'bcryptjs';
import { FieldValue } from 'firebase-admin/firestore';
import { db, fromDoc, toData } from '../../config/firebase.js';

/**
 * Firestore `users` collection (replaces the Mongoose User model).
 * Documents are keyed by an auto id; `_id` on returned objects is that id.
 * The bcrypt `password` hash is stripped from every read unless explicitly requested.
 */
const usersCol = db.collection('users');
const countersCol = db.collection('counters');

const DAY_MS = 24 * 60 * 60 * 1000;

const stripPassword = (user) => {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
};

// Same defaults the Mongoose schema used to apply.
const userDefaults = () => ({
  fullNameEn: '',
  additionalPhones: [],
  maritalStatus: 'திருமணம் ஆகாதவர்',
  education: 'பட்டதாரி',
  occupation: 'தனியார் பணி',
  workplace: '',
  monthlyIncome: '45,000/',
  incomeNum: 45000,
  height: '5.6 அடி',
  heightNum: 5.6,
  complexion: 'மாநிறம்',
  language: 'தமிழ்-முஸ்லிம்',
  state: 'Tamil Nadu',
  nativePlace: '',
  currentAddress: '',
  livingYears: '5 ஆண்டுகள்',
  location: '',
  property: 'சொந்த வீடு',
  bio: '',
  description: '',
  requirement: '',
  photos: [],
  audioClip: { url: '', filename: '', originalName: '', mimetype: '', size: 0, uploadedAt: new Date() },
  publisher: { name: '', relationship: 'Self' },
  declarationAgreed: false,
  minimumActiveUntil: new Date(Date.now() + 30 * DAY_MS),
  isOverseas: false,
  citizenship: 'Indian Citizen',
  countryOfResidence: 'India',
  role: 'user',
  isVerified: false,
  verificationStatus: 'pending',
  kycDocument: {
    docType: 'Aadhaar',
    filename: '',
    originalName: '',
    mimeType: '',
    size: 0,
    uploadedAt: new Date(),
    rejectionReason: '',
  },
  subscriptionStatus: 'free_trial',
  trialExpiresAt: new Date(Date.now() + 30 * DAY_MS),
  monthlyViewsCount: 0,
  shortlistedProfiles: [],
  matchNotified: false,
  isSuspended: false,
  suspensionReason: '',
  avatar: '',
});

// Sequential numeric Nikah IDs (100001, 100002, ...) via a transactional counter.
export const nextNikahId = async () => {
  const ref = countersCol.doc('nikahId');
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = (snap.exists ? snap.data().value : 100000) + 1;
    tx.set(ref, { value: next });
    return String(next);
  });
};

export const createUser = async (fields) => {
  const now = new Date();
  const salt = await bcrypt.genSalt(10);
  const data = {
    ...userDefaults(),
    ...fields,
    password: await bcrypt.hash(fields.password, salt),
    createdAt: now,
    updatedAt: now,
  };
  const ref = await usersCol.add(data);
  return stripPassword({ _id: ref.id, ...data });
};

export const getUserById = async (id, { withPassword = false } = {}) => {
  if (!id || typeof id !== 'string' || id.includes('/')) return null;
  const user = fromDoc(await usersCol.doc(id).get());
  return withPassword ? user : stripPassword(user);
};

export const findUserByNikahId = async (nikahId) => {
  const snap = await usersCol.where('nikahId', '==', String(nikahId)).limit(1).get();
  return snap.empty ? null : stripPassword(fromDoc(snap.docs[0]));
};

// Routes accept either the document id or the public Nikah ID.
export const findUserByIdOrNikahId = async (idOrNikahId) =>
  (await getUserById(idOrNikahId)) || (await findUserByNikahId(idOrNikahId));

/**
 * Find the first user matching any of the given values (replaces Mongo `$or` lookups).
 * Firestore `in` / `array-contains-any` accept at most 30 values per query.
 */
export const findUserByIdentifiers = async (
  { emails = [], phones = [], nikahIds = [] },
  { withPassword = false } = {}
) => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].slice(0, 30);
  const e = uniq(emails);
  const p = uniq(phones);
  const n = uniq(nikahIds);
  const queries = [];
  if (e.length) queries.push(usersCol.where('email', 'in', e).limit(1).get());
  if (n.length) queries.push(usersCol.where('nikahId', 'in', n).limit(1).get());
  if (p.length) {
    queries.push(usersCol.where('phone', 'in', p).limit(1).get());
    queries.push(usersCol.where('additionalPhones', 'array-contains-any', p).limit(1).get());
  }
  const results = await Promise.all(queries);
  const hit = results.find((s) => !s.empty);
  if (!hit) return null;
  const user = fromDoc(hit.docs[0]);
  return withPassword ? user : stripPassword(user);
};

export const comparePassword = (user, entered) => bcrypt.compare(entered, user.password || '');

// Apply a partial update and mirror it onto the in-memory object.
export const updateUser = async (user, patch) => {
  const data = { ...toData(patch), updatedAt: new Date() };
  await usersCol.doc(user._id).update(data);
  Object.assign(user, data);
  return user;
};

export const deleteUserById = (id) => usersCol.doc(id).delete();

export const addToShortlist = (userId, targetId) =>
  usersCol.doc(userId).update({ shortlistedProfiles: FieldValue.arrayUnion(targetId), updatedAt: new Date() });

export const removeFromShortlist = (userId, targetId) =>
  usersCol.doc(userId).update({ shortlistedProfiles: FieldValue.arrayRemove(targetId), updatedAt: new Date() });

// Fetch several users by id (missing ones are skipped).
export const getUsersByIds = async (ids) => {
  if (!ids || !ids.length) return [];
  const snaps = await db.getAll(...ids.map((id) => usersCol.doc(String(id))));
  return snaps.map(fromDoc).filter(Boolean).map(stripPassword);
};

// Run equality-only queries (no composite index needed) and return plain users.
export const findUsers = async (equals = {}) => {
  let q = usersCol;
  for (const [field, value] of Object.entries(equals)) q = q.where(field, '==', value);
  const snap = await q.get();
  return snap.docs.map((d) => stripPassword(fromDoc(d)));
};

export const countUsers = async (equals = {}) => {
  let q = usersCol;
  for (const [field, value] of Object.entries(equals)) q = q.where(field, '==', value);
  const agg = await q.count().get();
  return agg.data().count;
};
