import Setting from './Setting.js';
import { plain, toSet } from './common.js';

export const DEFAULT_SETTINGS = {
  key: 'global_settings',
  subscriptionPrice: 999,
  monthlySubscriptionPrice: 199,
  freeTierLimits: {
    maxProfileViews: 5,
    maxShortlistProfiles: 3,
  },
  features: {
    directPhoneAccess: true,
    audioIntroAccess: true,
    detailedBioAccess: true,
    shortlistAccess: true,
    photoFullView: true,
    newMatchAlerts: true,
  },
  featuredMarquee: {
    enabled: true,
    price: 299,
    durationDays: 15,
    visibleFields: {
      photo: true,
      nikahId: true,
      name: true,
      age: true,
      location: true,
      education: true,
      occupation: true,
      monthlyIncome: false,
      height: false,
      maritalStatus: false,
    },
  },
};

export const getSettings = async () => {
  let doc = await Setting.findOne({ key: 'global_settings' }).lean();
  if (!doc) {
    try {
      doc = await Setting.create(DEFAULT_SETTINGS);
      doc = doc.toObject();
    } catch {
      doc = await Setting.findOne({ key: 'global_settings' }).lean();
    }
  }
  return doc ? plain(doc) : DEFAULT_SETTINGS;
};

export const updateSettings = async (patch) => {
  const current = await getSettings();
  const merged = {
    ...current,
    ...patch,
    freeTierLimits: {
      ...current.freeTierLimits,
      ...(patch.freeTierLimits || {}),
    },
    features: {
      ...current.features,
      ...(patch.features || {}),
    },
    featuredMarquee: {
      ...(current.featuredMarquee || DEFAULT_SETTINGS.featuredMarquee),
      ...(patch.featuredMarquee || {}),
      visibleFields: {
        ...((current.featuredMarquee && current.featuredMarquee.visibleFields) || DEFAULT_SETTINGS.featuredMarquee.visibleFields),
        ...((patch.featuredMarquee && patch.featuredMarquee.visibleFields) || {}),
      },
    },
  };

  const data = toSet(merged);
  await Setting.updateOne({ key: 'global_settings' }, { $set: data }, { upsert: true });
  return await getSettings();
};
