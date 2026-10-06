import mongoose from 'mongoose';

// Lean Mongo docs -> the same plain shape the Firestore driver returns:
// ObjectIds become strings (so `a._id === b._id` and `.includes(id)` work), Dates stay Dates.
export const plain = (value) => {
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k !== '__v') out[k] = plain(v);
    }
    return out;
  }
  return value;
};

export const isValidId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id) && /^[0-9a-fA-F]{24}$/.test(id);

// Strip identity/bookkeeping fields before a $set.
export const toSet = (patch) => {
  const { _id, id, __v, createdAt, ...rest } = patch;
  return { ...rest, updatedAt: new Date() };
};
