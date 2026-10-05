import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getVerificationQueue,
  approveVerification,
  rejectVerification,
  viewSecureDocument,
  getAllUsers,
  toggleSuspendUser,
  updateUserSubscription,
  deleteUser,
  triggerMatches,
} from '../controllers/adminController.js';
import { getAllTickets, updateTicket } from '../controllers/supportController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { getAdminSecretKey } from '../config/secrets.js';

const router = express.Router();

// Public Admin Login Route (Unrestricted so Super Admin can submit credentials)
router.post('/login', adminLogin);

// Secret-key bypass middleware – allows the standalone admin page to authenticate
// by passing the secret key in the X-Admin-Key header, bypassing JWT.
const requireAdminAccess = (req, res, next) => {
  // Allow if the secret key header is present and correct
  const providedKey = req.headers['x-admin-key'];
  if (providedKey && providedKey === getAdminSecretKey()) {
    return next();
  }
  // Otherwise fall back to JWT-based admin auth
  verifyToken(req, res, () => {
    requireAdmin(req, res, next);
  });
};

// Apply admin access check across all remaining admin routes
router.use(requireAdminAccess);

// Verify admin token / key
router.get('/verify', (req, res) => {
  res.json({ success: true, valid: true });
});

// Dashboard overview
router.get('/stats', getDashboardStats);

// Verification Queue (approve / reject pending registrations)
router.get('/verifications', getVerificationQueue);
router.put('/verifications/:id/approve', approveVerification);
router.put('/verifications/:id/reject', rejectVerification);
router.post('/verifications/:id/trigger-matches', triggerMatches);

// Private document streaming (never served publicly)
router.get('/documents/:filename', viewSecureDocument);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleSuspendUser);
router.put('/users/:id/subscription', updateUserSubscription);
router.delete('/users/:id', deleteUser);

// Support tickets in admin panel
router.get('/tickets', getAllTickets);
router.put('/tickets/:id', updateTicket);

export default router;
