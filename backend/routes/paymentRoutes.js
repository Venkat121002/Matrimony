import express from 'express';
import { createSession, confirmPayment } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Start a Zoho Payments checkout session for a plan
router.post('/create-session', verifyToken, createSession);

// Browser reports widget success; the server re-checks with Zoho before activating
router.post('/confirm', verifyToken, confirmPayment);

// (The Zoho webhook is mounted in app.js with a raw body parser.)

export default router;
