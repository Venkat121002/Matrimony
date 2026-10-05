import express from 'express';
import { register, login, getMe, uploadKYC, updateMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadKYC as multerKYC, uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Register with media upload (photos, optional audio clip)
router.post('/register', uploadMedia, register);

// Login
router.post('/login', login);

// Current user profile & view quota stats
router.get('/me', verifyToken, getMe);

// Update user profile
router.put('/me', verifyToken, uploadMedia, updateMe);

// Re-upload KYC Document
router.post('/upload-kyc', verifyToken, multerKYC.single('kycDocument'), uploadKYC);

export default router;
