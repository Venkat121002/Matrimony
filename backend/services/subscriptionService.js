import { updateUser } from '../models/users.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export const PLAN_IDS = ['monthly_premium', 'annual_premium', 'featured_marquee'];

/**
 * Describes a purchasable plan using the admin-editable prices in Settings.
 * Returns null for an unknown plan id.
 */
export const resolvePlan = (planId, settings) => {
  switch (planId) {
    case 'monthly_premium':
      return {
        planId,
        kind: 'premium',
        plan: 'monthly',
        days: 30,
        priceInRupees: Number(settings?.monthlySubscriptionPrice ?? 199),
        title: 'Monthly Premium Membership (30 Days Unlimited)',
      };
    case 'annual_premium':
      return {
        planId,
        kind: 'premium',
        plan: 'annual',
        days: 365,
        priceInRupees: Number(settings?.subscriptionPrice ?? 999),
        title: 'Annual Premium Membership (1 Year Unlimited)',
      };
    case 'featured_marquee': {
      const days = Number(settings?.featuredMarquee?.durationDays ?? 15);
      return {
        planId,
        kind: 'marquee',
        days,
        priceInRupees: Number(settings?.featuredMarquee?.price ?? 299),
        title: `Running Bar Profile Promotion (${days} Days)`,
      };
    }
    default:
      return null;
  }
};

export const isPremiumActive = (user) =>
  user.subscriptionStatus === 'premium' && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();

export const isFeaturedActive = (user) =>
  user.isFeatured && user.featuredUntil && new Date(user.featuredUntil) > new Date();

// A renewal never shortens what the member already has: time is added after the current expiry.
const startFrom = (currentExpiry) => {
  const now = Date.now();
  const current = currentExpiry ? new Date(currentExpiry).getTime() : 0;
  return Math.max(now, current);
};

/** Activates `plan` on `user` for `days` days and returns the new expiry date. */
export const applyPlanToUser = async (user, plan, days) => {
  if (plan.kind === 'marquee') {
    const featuredUntil = new Date(startFrom(isFeaturedActive(user) ? user.featuredUntil : null) + days * DAY_MS);
    await updateUser(user, { isFeatured: true, featuredUntil });
    return featuredUntil;
  }

  const premiumExpiresAt = new Date(startFrom(isPremiumActive(user) ? user.premiumExpiresAt : null) + days * DAY_MS);
  await updateUser(user, {
    subscriptionStatus: 'premium',
    subscriptionPlan: plan.plan,
    premiumExpiresAt,
    monthlyViewsCount: 0,
  });
  return premiumExpiresAt;
};
