import express from 'express';
import {
  // createOrder,
  // verifyPayment,
  submitPaymentProof,
  getUserPaymentProofs,
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadPaymentProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Generate Cashfree Order (legacy/fallback)
// router.post('/create-order', verifyToken, createOrder);

// Verify Cashfree Payment (legacy/fallback)
// router.post('/verify-payment', verifyToken, verifyPayment);

// Submit Manual QR Payment Proof with Screenshot
router.post('/submit-proof', verifyToken, uploadPaymentProof, submitPaymentProof);

// Get User's Submitted Payment Proofs
router.get('/my-proofs', verifyToken, getUserPaymentProofs);

export default router;