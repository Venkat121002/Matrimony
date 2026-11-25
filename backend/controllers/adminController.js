import path from 'path';
import {
  findUsers,
  countUsers,
  getUserById,
  findUserByNikahId,
  updateUser,
  deleteUserById,
  byCreatedDesc,
} from '../models/users.js';
import { totalCapturedPaise, findPayments, getPaymentById as getPaymentByIdModel, getPaymentByOrderId, updatePayment } from '../models/payments.js';
import { countTickets } from '../models/supportTickets.js';
import { deleteViewsForUser } from '../models/profileViews.js';
import { streamStoredFile, deleteStoredFile } from '../middleware/uploadMiddleware.js';
import { getAdminSecretKey, getAdminCreds } from '../config/secrets.js';
import { sendVerificationStatusEmail } from '../services/emailService.js';
import { notifyMatchingPremiumUsers } from '../services/matchingService.js';
import { getSettings, updateSettings } from '../models/settings.js';

/**
 * Get Admin Dashboard Overview Metrics
 * GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, verifiedProfiles, activeSubscriptions, openTickets, totalRevenueInPaise, pendingUsers, allPayments] =
      await Promise.all([
        countUsers({ role: 'user' }),
        countUsers({ isVerified: true }),
        countUsers({ subscriptionStatus: 'premium' }),
        countTickets('open'),
        totalCapturedPaise(),
        findUsers({ verificationStatus: 'pending' }),
        findPayments({}).catch(() => []),
      ]);
    const pendingVerifications = pendingUsers.length;
    const pendingPaymentProofs = allPayments.filter(
      (p) => (p.gateway === 'manual_qr' || p.proofScreenshot) && p.status === 'pending'
    ).length;
    const totalRevenueInINR = totalRevenueInPaise / 100;

    // Recent activities (recent registrations and pending verifications)
    const recentPending = pendingUsers
      .sort(byCreatedDesc)
      .slice(0, 5)
      .map(({ _id, nikahId, fullName, email, phone, district, gender, kycDocument, createdAt }) => ({
        _id, nikahId, fullName, email, phone, district, gender, kycDocument, createdAt,
      }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingVerifications,
        pendingPaymentProofs,
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

    const fields = ['_id', 'nikahId', 'fullName', 'fullNameEn', 'email', 'phone', 'gender', 'age', 'district', 'state',
      'education', 'occupation', 'kycDocument', 'verificationStatus', 'isVerified', 'createdAt'];
    const time = (d) => d?.getTime?.() || 0;
    const all = (await findUsers(query)).sort(
      (a, b) => time(b.kycDocument?.uploadedAt) - time(a.kycDocument?.uploadedAt) || time(b.createdAt) - time(a.createdAt)
    );
    const total = all.length;
    const skip = (Number(page) - 1) * Number(limit);
    const users = all
      .slice(skip, skip + Number(limit))
      .map((u) => Object.fromEntries(fields.map((f) => [f, u[f]])));

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

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await updateUser(user, {
      isVerified: true,
      verificationStatus: 'verified',
      kycDocument: { ...(user.kycDocument || {}), verifiedAt: new Date(), rejectionReason: '' },
    });

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
    const user = await getUserById(id);
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

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await updateUser(user, {
      isVerified: false,
      verificationStatus: 'rejected',
      kycDocument: { ...(user.kycDocument || {}), rejectionReason: reason },
    });

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

    const found = await streamStoredFile('kyc', sanitizedFilename, res, {
      'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
      'Cache-Control': 'private, no-store',
    });
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Requested document file not found on private server storage.',
      });
    }
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

    if (status === 'verified') query.isVerified = true;
    if (status === 'pending') query.verificationStatus = 'pending';
    if (status === 'rejected') query.verificationStatus = 'rejected';
    if (status === 'suspended') query.isSuspended = true;

    if (subscription && subscription !== 'all') {
      query.subscriptionStatus = subscription;
    }

    let all = await findUsers(query);

    // Partial, case-insensitive search (done in memory; Firestore has no text search)
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      all = all.filter((u) =>
        ['fullName', 'email', 'phone', 'nikahId', 'district'].some((f) => String(u[f] ?? '').toLowerCase().includes(term))
      );
    }

    all.sort(byCreatedDesc);
    const total = all.length;
    const skip = (Number(page) - 1) * Number(limit);
    const users = all.slice(skip, skip + Number(limit));

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

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await updateUser(user, { isSuspended: Boolean(suspend), suspensionReason: suspend ? reason : '' });

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

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allowed = ['free_trial', 'premium', 'expired'];
    const patch = { subscriptionStatus: allowed.includes(subscriptionStatus) ? subscriptionStatus : 'premium' };
    if (patch.subscriptionStatus === 'premium') {
      patch.premiumExpiresAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
      patch.subscriptionPlan = Number(days) <= 35 ? 'monthly' : 'annual';
      patch.monthlyViewsCount = 0;
    }
    await updateUser(user, patch);

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

    const user = (await getUserById(id)) || (await findUserByNikahId(id));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove the user's stored media and KYC document from Cloud Storage / local disk
    const mediaFiles = [...(user.photos || []), user.audioClip?.url].filter(
      (u) => typeof u === 'string' && u.startsWith('/uploads/media/')
    );
    // Screenshots from the retired manual-UPI flow (payments/ folder)
    const paymentProofs = (await listPaymentsByUser(String(user._id)).catch(() => []))
      .map((p) => p.screenshot)
      .filter(Boolean);
    await Promise.all([
      ...mediaFiles.map((u) => deleteStoredFile('media', path.basename(u)).catch(() => {})),
      ...paymentProofs.map((f) => deleteStoredFile('payments', f).catch(() => {})),
      user.kycDocument?.filename ? deleteStoredFile('kyc', user.kycDocument.filename).catch(() => {}) : null,
      deleteViewsForUser(String(user._id)).catch(() => {}),
    ]);

    await deleteUserById(user._id);

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
    const {
      superUser: configuredSuperUser,
      superPass: configuredSuperPass,
      adminUser: configuredAdminUser,
      adminPass: configuredAdminPass,
    } = getAdminCreds();
    const adminSecretKey = getAdminSecretKey();

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

/**
 * Get Subscription and Feature Settings
 * GET /api/admin/subscription-settings
 */
export const getSubscriptionSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error('[Admin getSubscriptionSettings Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription settings.',
    });
  }
};

/**
 * Update Subscription and Feature Settings
 * PUT /api/admin/subscription-settings
 */
export const updateSubscriptionSettings = async (req, res) => {
  try {
    const { subscriptionPrice, monthlySubscriptionPrice, freeTierLimits, features, featuredMarquee } = req.body;
    const patch = {};

    if (subscriptionPrice !== undefined && !isNaN(Number(subscriptionPrice))) {
      patch.subscriptionPrice = Math.max(0, Number(subscriptionPrice));
    }

    if (monthlySubscriptionPrice !== undefined && !isNaN(Number(monthlySubscriptionPrice))) {
      patch.monthlySubscriptionPrice = Math.max(0, Number(monthlySubscriptionPrice));
    }

    if (freeTierLimits && typeof freeTierLimits === 'object') {
      patch.freeTierLimits = {};
      if (freeTierLimits.maxProfileViews !== undefined && !isNaN(Number(freeTierLimits.maxProfileViews))) {
        patch.freeTierLimits.maxProfileViews = Math.max(0, Number(freeTierLimits.maxProfileViews));
      }
      if (freeTierLimits.maxShortlistProfiles !== undefined && !isNaN(Number(freeTierLimits.maxShortlistProfiles))) {
        patch.freeTierLimits.maxShortlistProfiles = Math.max(0, Number(freeTierLimits.maxShortlistProfiles));
      }
    }

    if (features && typeof features === 'object') {
      patch.features = {};
      for (const [key, val] of Object.entries(features)) {
        patch.features[key] = Boolean(val);
      }
    }

    if (featuredMarquee && typeof featuredMarquee === 'object') {
      patch.featuredMarquee = {
        enabled: featuredMarquee.enabled !== undefined ? Boolean(featuredMarquee.enabled) : true,
        price: Math.max(0, Number(featuredMarquee.price) || 299),
        durationDays: Math.max(1, Number(featuredMarquee.durationDays) || 15),
        visibleFields: {
          photo: featuredMarquee.visibleFields?.photo !== undefined ? Boolean(featuredMarquee.visibleFields.photo) : true,
          nikahId: featuredMarquee.visibleFields?.nikahId !== undefined ? Boolean(featuredMarquee.visibleFields.nikahId) : true,
          name: featuredMarquee.visibleFields?.name !== undefined ? Boolean(featuredMarquee.visibleFields.name) : true,
          age: featuredMarquee.visibleFields?.age !== undefined ? Boolean(featuredMarquee.visibleFields.age) : true,
          location: featuredMarquee.visibleFields?.location !== undefined ? Boolean(featuredMarquee.visibleFields.location) : true,
          education: featuredMarquee.visibleFields?.education !== undefined ? Boolean(featuredMarquee.visibleFields.education) : true,
          occupation: featuredMarquee.visibleFields?.occupation !== undefined ? Boolean(featuredMarquee.visibleFields.occupation) : true,
          monthlyIncome: Boolean(featuredMarquee.visibleFields?.monthlyIncome),
          height: Boolean(featuredMarquee.visibleFields?.height),
          maritalStatus: Boolean(featuredMarquee.visibleFields?.maritalStatus),
        },
      };
    }

    const updated = await updateSettings(patch);
    res.json({
      success: true,
      message: 'Subscription and feature settings updated successfully.',
      settings: updated,
    });
  } catch (err) {
    console.error('[Admin updateSubscriptionSettings Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription settings.',
    });
  }
};

/**
 * Get All Payment Proofs
 * GET /api/admin/payment-proofs
 */
export const getPaymentProofs = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    const allPayments = await findPayments({});
    let proofs = allPayments.filter((p) => p.gateway === 'manual_qr' || p.proofScreenshot);

    if (status && status !== 'all') {
      proofs = proofs.filter((p) => p.status === status);
    }

    // Populate user info if not already populated
    const populated = await Promise.all(
      proofs.map(async (p) => {
        let user = p.userId;
        if (!user || typeof user === 'string' || !user.fullName) {
          const fetched = await getUserById(p.userId).catch(() => null);
          if (fetched) {
            user = {
              _id: fetched._id,
              nikahId: fetched.nikahId,
              fullName: fetched.fullName,
              fullNameEn: fetched.fullNameEn,
              phone: fetched.phone,
              email: fetched.email,
              district: fetched.district,
              photo: fetched.photo || (fetched.photos && fetched.photos[0]),
              isFeatured: fetched.isFeatured,
              subscriptionStatus: fetched.subscriptionStatus,
            };
          } else {
            user = p.userSnapshot || { nikahId: 'N/A', fullName: 'Unknown User' };
          }
        }
        return {
          ...p,
          user,
        };
      })
    );

    const pendingCount = allPayments.filter(
      (p) => (p.gateway === 'manual_qr' || p.proofScreenshot) && p.status === 'pending'
    ).length;

    res.json({
      success: true,
      proofs: populated,
      total: populated.length,
      pendingCount,
    });
  } catch (err) {
    console.error('[Get Payment Proofs Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment proofs.',
    });
  }
};

/**
 * Approve Payment Proof and Enable User Requested Feature
 * PUT /api/admin/payment-proofs/:id/approve
 */
export const approvePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    let payment = (await getPaymentByIdModel(id)) || (await getPaymentByOrderId(id));

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const userId = payment.userId?._id || payment.userId;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User belonging to payment proof not found.' });
    }

    const planType = payment.planType || '';
    const planName = (payment.planName || '').toLowerCase();
    const isMarquee =
      planType === 'featured_marquee' ||
      planType === 'featured_profile' ||
      planName.includes('running bar') ||
      planName.includes('marquee') ||
      planName.includes('featured');
    const isMonthly =
      planType === 'monthly_subscription' ||
      planName.includes('monthly') ||
      planName.includes('30 days');

    let activatedFeature = '';

    if (isMarquee) {
      const settings = await getSettings();
      const durationDays = Number(settings?.featuredMarquee?.durationDays || 15);
      const featuredUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      await updateUser(user, {
        isFeatured: true,
        featuredUntil,
      });
      activatedFeature = `Featured Profile in Running Marquee Bar (${durationDays} Days)`;
    } else if (isMonthly) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await updateUser(user, {
        subscriptionStatus: 'premium',
        subscriptionPlan: 'monthly',
        premiumExpiresAt: expiresAt,
        monthlyViewsCount: 0,
      });
      activatedFeature = 'Monthly Premium Membership (30 Days Unlimited)';
    } else {
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await updateUser(user, {
        subscriptionStatus: 'premium',
        subscriptionPlan: 'annual',
        premiumExpiresAt: expiresAt,
        monthlyViewsCount: 0,
      });
      activatedFeature = 'Annual Premium Membership (1 Year Unlimited)';
    }

    await updatePayment(payment, {
      status: 'approved',
      capturedAt: new Date(),
      verifiedAt: new Date(),
      verifiedBy: req.user?.username || 'Admin',
      rejectionReason: '',
    });

    res.json({
      success: true,
      message: `Alhamdulillah! Payment proof verified and ${activatedFeature} activated for ${user.nikahId} (${user.fullName}).`,
      payment,
      activatedFeature,
    });
  } catch (err) {
    console.error('[Approve Payment Proof Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to approve payment proof.',
    });
  }
};

/**
 * Reject Payment Proof
 * PUT /api/admin/payment-proofs/:id/reject
 */
export const rejectPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Payment screenshot could not be verified or amount was not received.' } = req.body;

    let payment = (await getPaymentByIdModel(id)) || (await getPaymentByOrderId(id));
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    await updatePayment(payment, {
      status: 'rejected',
      rejectionReason: reason,
      verifiedAt: new Date(),
      verifiedBy: req.user?.username || 'Admin',
    });

    res.json({
      success: true,
      message: 'Payment proof marked as rejected.',
      payment,
    });
  } catch (err) {
    console.error('[Reject Payment Proof Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment proof.',
    });
  }
};

/**
 * Manually toggle featured status on any user
 * PUT /api/admin/users/:id/featured
 */
export const toggleUserFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, durationDays = 15 } = req.body;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const setFeatured = Boolean(isFeatured);
    const featuredUntil = setFeatured ? new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000) : null;

    await updateUser(user, {
      isFeatured: setFeatured,
      featuredUntil,
    });

    res.json({
      success: true,
      message: setFeatured
        ? `Profile ${user.nikahId} (${user.fullName}) is now featured in the Running Marquee Bar for ${durationDays} days.`
        : `Featured status removed for profile ${user.nikahId}.`,
      isFeatured: setFeatured,
      featuredUntil,
    });
  } catch (err) {
    console.error('[Toggle User Featured Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured profile status.',
    });
  }
};

