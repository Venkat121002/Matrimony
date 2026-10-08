import { db, fromDoc, toData } from '../../config/firebase.js';

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

const settingsCol = db.collection('settings');

export const getSettings = async () => {
  const doc = await settingsCol.doc('global_settings').get();
  if (!doc.exists) {
    const data = { ...DEFAULT_SETTINGS, createdAt: new Date(), updatedAt: new Date() };
    await settingsCol.doc('global_settings').set(data);
    return { _id: 'global_settings', ...data };
  }
  return fromDoc(doc);
};

export const updateSettings = async (patch) => {
  const current = await getSettings();
  const merged = {
    ...current,
    ...patch,
    freeTierLimits: {
      ...(current.freeTierLimits || DEFAULT_SETTINGS.freeTierLimits),
      ...(patch.freeTierLimits || {}),
    },
    features: {
      ...(current.features || DEFAULT_SETTINGS.features),
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
    updatedAt: new Date(),
  };

  const data = toData(merged);
  await settingsCol.doc('global_settings').set(data, { merge: true });
  return await getSettings();
};
