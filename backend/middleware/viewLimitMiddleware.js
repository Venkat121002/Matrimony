import ProfileView from '../models/ProfileView.js';
import User from '../models/User.js';

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
    if (viewer._id.toString() === targetProfileId || viewer.nikahId === targetProfileId) {
      return next();
    }

    // Find the target user document to get their ObjectId
    let targetUser = null;
    if (targetProfileId.match(/^[0-9a-fA-F]{24}$/)) {
      targetUser = await User.findById(targetProfileId);
    } else {
      targetUser = await User.findOne({ nikahId: targetProfileId });
    }

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
      viewer.subscriptionStatus = 'expired';
      await viewer.save();
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
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get list of distinct profiles viewed by this user
    const viewedProfileIds = await ProfileView.distinct('viewedProfileId', {
      viewerId: viewer._id,
    });

    const isAlreadyViewed = viewedProfileIds.some(
      (id) => id.toString() === targetUser._id.toString()
    );

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
    await ProfileView.create({
      viewerId: viewer._id,
      viewedProfileId: targetUser._id,
      monthYear,
      viewedAt: now,
    });

    // Update user record
    viewer.monthlyViewsCount = viewedProfileIds.length + 1;
    await viewer.save();

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
