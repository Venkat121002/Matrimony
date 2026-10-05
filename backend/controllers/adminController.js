import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import SupportTicket from '../models/SupportTicket.js';
import { getPrivateKYCDir } from '../middleware/uploadMiddleware.js';
import { sendVerificationStatusEmail } from '../services/emailService.js';
import { notifyMatchingPremiumUsers } from '../services/matchingService.js';

/**
 * Get Admin Dashboard Overview Metrics
 * GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    const verifiedProfiles = await User.countDocuments({ isVerified: true });
    const activeSubscriptions = await User.countDocuments({ subscriptionStatus: 'premium' });
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });

    // Aggregate total revenue from captured payments
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenueInPaise = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    const totalRevenueInINR = totalRevenueInPaise / 100;

    // Recent activities (recent registrations and pending verifications)
    const recentPending = await User.find({ verificationStatus: 'pending' })
      .select('nikahId fullName email phone district gender kycDocument createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingVerifications,
        verifiedProfiles,
        activeSubscriptions,
        openTickets,
        totalRevenue: totalRevenueInINR,
      },
      recentPending,
    });
  } catch (err) {
    console.error('[Admin Stats Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats.',
    });
  }
};

/**
 * Get Pending Verification Queue
 * GET /api/admin/verifications
 */
export const getVerificationQueue = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const query = status === 'all' ? {} : { verificationStatus: status };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('nikahId fullName fullNameEn email phone gender age district state education occupation kycDocument verificationStatus isVerified createdAt')
      .sort({ 'kycDocument.uploadedAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification queue.',
    });
  }
};

/**
 * Approve User KYC & Verification
 * PUT /api/admin/verifications/:id/approve
 */
export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isVerified = true;
    user.verificationStatus = 'verified';
    if (user.kycDocument) {
      user.kycDocument.verifiedAt = new Date();
      user.kycDocument.rejectionReason = '';
    }
    await user.save();

    // Trigger transactional approval email
    sendVerificationStatusEmail(user, true).catch((err) =>
      console.error('[Email Worker] Verification approval email error:', err.message)
    );

    // If matching recommendation hasn't been sent yet, dispatch to suitable premium accounts
    if (!user.matchNotified) {
      notifyMatchingPremiumUsers(user).catch((err) =>
        console.error('[Match Worker] Approval match notification error:', err.message)
      );
    }

    res.json({
      success: true,
      message: `Profile ${user.nikahId} (${user.fullName}) has been approved and is now live!`,
      user: {
        id: user._id,
        nikahId: user.nikahId,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve profile.',
    });
  }
};

/**
 * Manually Trigger Match Recommendations for a Profile
 * POST /api/admin/verifications/:id/trigger-matches
 */
export const triggerMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const matchResult = await notifyMatchingPremiumUsers(user);
    res.json({
      success: true,
      message: `Match notification processed for ${user.fullName} (${user.nikahId})`,
      matchResult,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to dispatch matches.',
    });
  }
};


/**
 * Reject User KYC Verification
 * PUT /api/admin/verifications/:id/reject
 */
export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Document is blurry or details do not match' } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isVerified = false;
    user.verificationStatus = 'rejected';
    if (user.kycDocument) {
      user.kycDocument.rejectionReason = reason;
    }
    await user.save();

    // Trigger transactional rejection email
    sendVerificationStatusEmail(user, false, reason).catch((err) =>
      console.error('[Email Worker] Verification rejection email error:', err.message)
    );

    res.json({
      success: true,
      message: `Profile ${user.nikahId} marked as rejected. Notification email sent.`,
      user: {
        id: user._id,
        nikahId: user.nikahId,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        rejectionReason: reason,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification.',
    });
  }
};

/**
 * Securely Stream Private KYC Document to Authorized Admin
 * GET /api/admin/documents/:filename
 */
export const viewSecureDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const sanitizedFilename = path.basename(filename); // Prevent path traversal attacks
    const filePath = path.join(getPrivateKYCDir(), sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Requested document file not found on private server storage.',
      });
    }

    const ext = path.extname(sanitizedFilename).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };

    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFilename}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('[View Document Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Error streaming document.',
    });
  }
};

/**
 * Manage Users (List, Filter, Suspend, Upgrade)
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, status, subscription, page = 1, limit = 500 } = req.query;

    const query = { role: 'user' };

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: reg }, { email: reg }, { phone: reg }, { nikahId: reg }, { district: reg }];
    }

    if (status === 'verified') query.isVerified = true;
    if (status === 'pending') query.verificationStatus = 'pending';
    if (status === 'rejected') query.verificationStatus = 'rejected';
    if (status === 'suspended') query.isSuspended = true;

    if (subscription && subscription !== 'all') {
      query.subscriptionStatus = subscription;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users list.',
    });
  }
};

/**
 * Suspend or Unsuspend User
 * PUT /api/admin/users/:id/suspend
 */
export const toggleSuspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend, reason = '' } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isSuspended = Boolean(suspend);
    user.suspensionReason = suspend ? reason : '';
    await user.save();

    res.json({
      success: true,
      message: user.isSuspended ? `User ${user.nikahId} suspended.` : `User ${user.nikahId} reactivated.`,
      user: { id: user._id, isSuspended: user.isSuspended, suspensionReason: user.suspensionReason },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user suspension state.' });
  }
};

/**
 * Grant or Modify User Subscription Manually
 * PUT /api/admin/users/:id/subscription
 */
export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionStatus, days = 365 } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscriptionStatus = subscriptionStatus || 'premium';
    if (user.subscriptionStatus === 'premium') {
      user.premiumExpiresAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
      user.monthlyViewsCount = 0;
    }
    await user.save();

    res.json({
      success: true,
      message: `Subscription updated to ${user.subscriptionStatus} for ${user.nikahId}`,
      user: {
        id: user._id,
        subscriptionStatus: user.subscriptionStatus,
        premiumExpiresAt: user.premiumExpiresAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update subscription.' });
  }
};

/**
 * Delete User Account Permanently
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Optionally delete uploaded photo files from disk
    if (user.photos && user.photos.length > 0) {
      user.photos.forEach((photoUrl) => {
        try {
          const filename = path.basename(photoUrl);
          const filePath = path.join(process.cwd(), 'uploads', 'media', filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (e) {
          // ignore file-not-found errors silently
        }
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User ${user.nikahId} (${user.fullName}) has been permanently deleted.`,
    });
  } catch (err) {
    console.error('[Delete User Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

/**
 * Admin & Super Admin Login Authentication
 * POST /api/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password, portalType } = req.body;
    const configuredSuperUser = process.env.SUPERADMIN_USERNAME || 'superadmin';
    const configuredSuperPass = process.env.SUPERADMIN_PASSWORD || 'Admin@TamilNikah2026!';
    const configuredAdminUser = process.env.ADMIN_USERNAME || 'admin';
    const configuredAdminPass = process.env.ADMIN_PASSWORD || 'Admin@TamilNikah2026!';
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'nikah-admin-secret-2026';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const trimmedUser = username.trim();

    // 1. Explicit admin portal login
    if (portalType === 'admin') {
      if (trimmedUser === configuredAdminUser && password === configuredAdminPass) {
        return res.json({
          success: true,
          message: 'Admin authenticated successfully.',
          adminKey: adminSecretKey,
          adminUser: {
            username: configuredAdminUser,
            role: 'admin',
          },
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin username or password.',
      });
    }

    // 2. Explicit superadmin portal login
    if (portalType === 'superadmin') {
      if (trimmedUser === configuredSuperUser && password === configuredSuperPass) {
        return res.json({
          success: true,
          message: 'Super Admin authenticated successfully.',
          adminKey: adminSecretKey,
          adminUser: {
            username: configuredSuperUser,
            role: 'superadmin',
          },
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid Super Admin username or password.',
      });
    }

    // 3. Fallback if portalType is not specified
    if (trimmedUser === configuredSuperUser && password === configuredSuperPass) {
      return res.json({
        success: true,
        message: 'Super Admin authenticated successfully.',
        adminKey: adminSecretKey,
        adminUser: {
          username: configuredSuperUser,
          role: 'superadmin',
        },
      });
    }

    if (trimmedUser === configuredAdminUser && password === configuredAdminPass) {
      return res.json({
        success: true,
        message: 'Admin authenticated successfully.',
        adminKey: adminSecretKey,
        adminUser: {
          username: configuredAdminUser,
          role: 'admin',
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid administrator username or password.',
    });
  } catch (err) {
    console.error('[Admin Login Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication.',
    });
  }
};

