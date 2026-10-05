import express from 'express';
import {
  getProfiles,
  getProfileById,
  getDistrictsSummary,
  getMyShortlist,
  toggleShortlist,
} from '../controllers/profileController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import { checkProfileViewLimit } from '../middleware/viewLimitMiddleware.js';

const router = express.Router();

// List public verified profiles (with district, age, marital status, education filters)
router.get('/', optionalAuth, getProfiles);

// District list and profile statistics
router.get('/districts', getDistrictsSummary);

// User's chosen / shortlisted profiles (3 max on free tier, unlimited on premium)
router.get('/my-shortlist', verifyToken, getMyShortlist);
router.post('/shortlist/toggle/:id', verifyToken, toggleShortlist);

// Single profile detailed view (enforces 5 profiles limit on free trial & locks contacts for free tier)
router.get('/:id', verifyToken, checkProfileViewLimit, getProfileById);

export default router;
