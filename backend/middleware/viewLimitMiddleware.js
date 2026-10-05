import { findUserByIdOrNikahId, updateUser } from '../models/users.js';
import { distinctViewedProfileIds, recordView, currentMonthYear } from '../models/profileViews.js';

export const checkProfileViewLimit = async (req, res, next) => {
  try {
    const viewer = req.user;
    const targetProfileId = req.params.id;

    if (!viewer) {
      return res.status(401).json({
        success: false,
        requiresLogin: true,
        message: 'Please log in or register to view full profile and family details.',
      });
    }

    // Admins have unrestricted access
    if (viewer.role === 'admin') {
      return next();
    }

    // Viewing own profile is always permitted
    if (viewer._id === targetProfileId || viewer.nikahId === targetProfileId) {
      req.targetProfile = viewer;
      return next();
    }

    // Accepts either the document id or the public Nikah ID
    const targetUser = await findUserByIdOrNikahId(targetProfileId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    req.targetProfile = targetUser;

    // Check if target profile is verified (strict gating)
    if (!targetUser.isVerified && viewer.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This profile is currently undergoing identity verification and is not yet public.',
      });
    }

    // Premium users have unlimited views & contact details
    if (viewer.subscriptionStatus === 'premium') {
      req.viewStats = {
        isPremium: true,
        unlimited: true,
        canAccessContacts: true,
      };
      return next();
    }

    // Free Trial / Free Tier Checks
    const now = new Date();
    if (viewer.subscriptionStatus === 'free_trial' && viewer.trialExpiresAt < now) {
      await updateUser(viewer, { subscriptionStatus: 'expired' });
      return res.status(403).json({
        success: false,
        limitReached: true,
        trialExpired: true,
        message: 'Your free trial has expired. Please upgrade to Premium to view unlimited profiles and direct contact details.',
        upgradeRequired: true,
      });
    }

    if (viewer.subscriptionStatus === 'expired') {
      return res.status(403).json({
        success: false,
        limitReached: true,
        trialExpired: true,
        message: 'Your membership is expired. Upgrade to Premium for unlimited profile and contact access.',
        upgradeRequired: true,
      });
    }

    // Current Month-Year key (e.g., "2026-09")
    const monthYear = currentMonthYear(now);

    // Get list of distinct profiles viewed by this user
    const viewedProfileIds = await distinctViewedProfileIds(viewer._id);

    const isAlreadyViewed = viewedProfileIds.includes(targetUser._id);

    const FREE_TIER_LIMIT = 5;

    if (isAlreadyViewed) {
      req.viewStats = {
        isPremium: false,
        viewsUsed: viewedProfileIds.length,
        viewsRemaining: Math.max(0, FREE_TIER_LIMIT - viewedProfileIds.length),
        limit: FREE_TIER_LIMIT,
        canAccessContacts: false,
        alreadyViewed: true,
      };
      return next();
    }

    // New profile view attempt: Enforce strict 5 profile limit on Free Tier
    if (viewedProfileIds.length >= FREE_TIER_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        limit: FREE_TIER_LIMIT,
        monthlyLimit: FREE_TIER_LIMIT,
        viewsUsed: viewedProfileIds.length,
        viewsRemaining: 0,
        message: `With free tier, you can only see details of up to ${FREE_TIER_LIMIT} profiles. Upgrade to Premium for unlimited profiles and direct contact details.`,
        upgradeRequired: true,
      });
    }

    // Record the new profile view
    await recordView(viewer._id, targetUser._id, monthYear, now);

    // Update user record
    await updateUser(viewer, { monthlyViewsCount: viewedProfileIds.length + 1 });

    req.viewStats = {
      isPremium: false,
      viewsUsed: viewedProfileIds.length + 1,
      viewsRemaining: Math.max(0, FREE_TIER_LIMIT - (viewedProfileIds.length + 1)),
      limit: FREE_TIER_LIMIT,
      canAccessContacts: false,
      alreadyViewed: false,
    };

    next();
  } catch (err) {
    console.error('[ViewLimit Middleware Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Server error verifying profile view limits.',
    });
  }
};
