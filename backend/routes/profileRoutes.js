import express from 'express';
import {
  getProfiles,
  getProfileById,
  getDistrictsSummary,
  getMyShortlist,
  toggleShortlist,
  getFeaturedMarqueeProfiles,
  featureMyProfile,
} from '../controllers/profileController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import { checkProfileViewLimit } from '../middleware/viewLimitMiddleware.js';

import { getSettings } from '../models/settings.js';

const router = express.Router();

// Public Running Marquee Bar Featured Profiles
router.get('/featured-marquee', getFeaturedMarqueeProfiles);

// Feature Current User's Profile for the Running Bar
router.post('/feature-me', verifyToken, featureMyProfile);

// Public Subscription & Feature settings (price, free limits, enabled features)
router.get('/subscription-settings', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription settings.',
    });
  }
});

// List public verified profiles (with district, age, marital status, education filters)
router.get('/', optionalAuth, getProfiles);

// District list and profile statistics
router.get('/districts', getDistrictsSummary);

// User's chosen / shortlisted profiles (free tier limit, unlimited on premium)
router.get('/my-shortlist', verifyToken, getMyShortlist);
router.post('/shortlist/toggle/:id', verifyToken, toggleShortlist);

// Single profile detailed view (enforces view limits on free trial & locks contacts for free tier)
router.get('/:id', verifyToken, checkProfileViewLimit, getProfileById);

export default router;
