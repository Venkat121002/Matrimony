import express from 'express';
import {
  register,
  login,
  getMe,
  uploadKYC,
  updateMe,
  forgotPassword,
  verifyResetOtpHandler,
  resetPassword,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadKYC as uploadKYCFile, uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Register with media upload (photos, optional audio clip)
router.post('/register', uploadMedia, register);

// Login
router.post('/login', login);

// Forgot Password via Email OTP
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtpHandler);
router.post('/reset-password', resetPassword);

// Current user profile & view quota stats
router.get('/me', verifyToken, getMe);

// Update user profile
router.put('/me', verifyToken, uploadMedia, updateMe);

// Re-upload KYC Document
router.post('/upload-kyc', verifyToken, uploadKYCFile('kycDocument'), uploadKYC);

export default router;
