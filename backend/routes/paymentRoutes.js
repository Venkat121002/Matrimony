import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate Razorpay Order
router.post('/create-order', verifyToken, createOrder);

// Verify Razorpay Client Signature
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;
