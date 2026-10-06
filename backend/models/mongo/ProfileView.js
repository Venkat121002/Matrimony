import mongoose from 'mongoose';

const profileViewSchema = new mongoose.Schema(
  {
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    viewedProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    monthYear: {
      type: String, // e.g. "2026-09"
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per month if checking unique profiles
profileViewSchema.index({ viewerId: 1, viewedProfileId: 1, monthYear: 1 }, { unique: true });

const ProfileView = mongoose.model('ProfileView', profileViewSchema);
export default ProfileView;
