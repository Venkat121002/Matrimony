import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate Cashfree Order
router.post('/create-order', verifyToken, createOrder);

// Verify Cashfree Payment
router.post('/verify-payment', verifyToken, verifyPayment);

export default router;
