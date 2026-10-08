import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './User.js';
import { plain, isValidId, toSet } from './common.js';

/**
 * MongoDB driver for users (local development). Same exports and return shapes as
 * ../firestore/users.js; the bcrypt `password` hash is stripped unless requested.
 */

const Counter =
  mongoose.models.Counter ||
  mongoose.model('Counter', new mongoose.Schema({ _id: String, value: Number }, { versionKey: false }));

const stripPassword = (user) => {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
};

// Sequential numeric Nikah IDs. The counter is seeded from the highest existing
// numeric nikahId so databases created by the old max-scan logic keep counting up.
export const nextNikahId = async () => {
  if (!(await Counter.exists({ _id: 'nikahId' }))) {
    let max = 100000;
    for (const u of await User.find({}, { nikahId: 1 }).lean()) {
      const n = parseInt(String(u.nikahId || '').replace(/\D/g, ''), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    await Counter.updateOne({ _id: 'nikahId' }, { $setOnInsert: { value: max } }, { upsert: true });
  }
  const counter = await Counter.findOneAndUpdate({ _id: 'nikahId' }, { $inc: { value: 1 } }, { new: true });
  return String(counter.value);
};

export const createUser = async (fields) => {
  const salt = await bcrypt.genSalt(10);
  const doc = await User.create({ ...fields, password: await bcrypt.hash(fields.password, salt) });
  return stripPassword(plain(doc.toObject()));
};

export const getUserById = async (id, { withPassword = false } = {}) => {
  if (!isValidId(id)) return null;
  const q = User.findById(id);
  if (withPassword) q.select('+password');
  return plain(await q.lean());
};

export const findUserByNikahId = async (nikahId) => plain(await User.findOne({ nikahId: String(nikahId) }).lean());

export const findUserByIdOrNikahId = async (idOrNikahId) =>
  (await getUserById(idOrNikahId)) || (await findUserByNikahId(idOrNikahId));

const escapeRegex = (s) => String(s).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

export const findUserByIdentifiers = async (
  { emails = [], phones = [], nikahIds = [] },
  { withPassword = false } = {}
) => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const or = [];

  const cleanEmails = uniq(emails);
  if (cleanEmails.length) {
    or.push({ email: { $in: cleanEmails } });
    cleanEmails.forEach((e) => {
      or.push({ email: new RegExp(`^${escapeRegex(e.trim())}$`, 'i') });
    });
  }

  const cleanNikahIds = uniq(nikahIds);
  if (cleanNikahIds.length) {
    or.push({ nikahId: { $in: cleanNikahIds } });
    cleanNikahIds.forEach((n) => {
      or.push({ nikahId: new RegExp(`^${escapeRegex(n.trim())}$`, 'i') });
    });
  }

  const cleanPhones = uniq(phones);
  if (cleanPhones.length) {
    or.push({ phone: { $in: cleanPhones } });
    or.push({ additionalPhones: { $in: cleanPhones } });

    // Match core digit patterns for phones (tolerates spaces, +, dashes)
    for (const p of cleanPhones) {
      const d = String(p).replace(/\D/g, '');
      if (d.length >= 7) {
        const core = d.length > 10 ? d.slice(-10) : d;
        const pattern = new RegExp(core.split('').join('\\D*'), 'i');
        or.push({ phone: pattern });
        or.push({ additionalPhones: pattern });
      }
    }
  }

  if (!or.length) return null;
  const q = User.findOne({ $or: or });
  if (withPassword) q.select('+password');
  return plain(await q.lean());
};

export const comparePassword = (user, entered) => bcrypt.compare(entered, user.password || '');

export const setResetOtp = async (userId, code, expiresAt) => {
  await User.updateOne(
    { _id: userId },
    { $set: { resetOtp: { code, expiresAt, verified: false }, updatedAt: new Date() } }
  );
};

export const verifyResetOtp = async (userId, code) => {
  const user = await User.findById(userId);
  if (!user || !user.resetOtp || !user.resetOtp.code) return false;
  if (String(user.resetOtp.code).trim() !== String(code).trim()) return false;
  if (user.resetOtp.expiresAt && new Date(user.resetOtp.expiresAt) < new Date()) return false;
  await User.updateOne({ _id: userId }, { $set: { 'resetOtp.verified': true, updatedAt: new Date() } });
  return true;
};

export const checkResetOtpVerified = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.resetOtp) return false;
  if (!user.resetOtp.verified) return false;
  if (user.resetOtp.expiresAt && new Date(user.resetOtp.expiresAt) < new Date()) return false;
  return true;
};

export const setUserPassword = async (userId, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  await User.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword, resetOtp: { code: '', expiresAt: null, verified: false }, updatedAt: new Date() } }
  );
};

export const updateUser = async (user, patch) => {
  const data = toSet(patch);
  delete data.password;
  await User.updateOne({ _id: user._id }, { $set: data });
  Object.assign(user, data);
  return user;
};

export const deleteUserById = (id) => User.deleteOne({ _id: id });

export const addToShortlist = (userId, targetId) =>
  User.updateOne({ _id: userId }, { $addToSet: { shortlistedProfiles: targetId }, $set: { updatedAt: new Date() } });

export const removeFromShortlist = (userId, targetId) =>
  User.updateOne({ _id: userId }, { $pull: { shortlistedProfiles: targetId }, $set: { updatedAt: new Date() } });

export const getUsersByIds = async (ids) => {
  const valid = (ids || []).map(String).filter(isValidId);
  if (!valid.length) return [];
  const byId = new Map(plain(await User.find({ _id: { $in: valid } }).lean()).map((u) => [u._id, u]));
  return valid.map((id) => byId.get(id)).filter(Boolean); // keep shortlist order
};

export const findUsers = async (equals = {}) => plain(await User.find(equals).lean());

export const countUsers = (equals = {}) => User.countDocuments(equals);
