import express from 'express';
import { submitPaymentProof, getMyPaymentRequests } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { uploadPaymentProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Member uploads a GPay/UPI payment screenshot for admin review
router.post('/submit-proof', verifyToken, uploadPaymentProof, submitPaymentProof);

// Member's own request history
router.get('/my-requests', verifyToken, getMyPaymentRequests);

export default router;
