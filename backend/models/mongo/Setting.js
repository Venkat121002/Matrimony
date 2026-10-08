import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_settings',
    },
    subscriptionPrice: {
      type: Number,
      required: true,
      default: 999,
    },
    monthlySubscriptionPrice: {
      type: Number,
      required: true,
      default: 199,
    },
    freeTierLimits: {
      maxProfileViews: {
        type: Number,
        required: true,
        default: 5,
      },
      maxShortlistProfiles: {
        type: Number,
        required: true,
        default: 3,
      },
    },
    features: {
      directPhoneAccess: {
        type: Boolean,
        default: true,
      },
      audioIntroAccess: {
        type: Boolean,
        default: true,
      },
      detailedBioAccess: {
        type: Boolean,
        default: true,
      },
      shortlistAccess: {
        type: Boolean,
        default: true,
      },
      photoFullView: {
        type: Boolean,
        default: true,
      },
      newMatchAlerts: {
        type: Boolean,
        default: true,
      },
    },
    featuredMarquee: {
      enabled: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        default: 299,
      },
      durationDays: {
        type: Number,
        default: 15,
      },
      visibleFields: {
        photo: { type: Boolean, default: true },
        nikahId: { type: Boolean, default: true },
        name: { type: Boolean, default: true },
        age: { type: Boolean, default: true },
        location: { type: Boolean, default: true },
        education: { type: Boolean, default: true },
        occupation: { type: Boolean, default: true },
        monthlyIncome: { type: Boolean, default: false },
        height: { type: Boolean, default: false },
        maritalStatus: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
