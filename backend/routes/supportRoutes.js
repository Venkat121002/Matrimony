import express from 'express';
import { createTicket } from '../controllers/supportController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User contact ticket submission
router.post('/', optionalAuth, createTicket);

export default router;
