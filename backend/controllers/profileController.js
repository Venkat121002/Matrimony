import {
  findUsers,
  findUserByIdOrNikahId,
  getUsersByIds,
  addToShortlist,
  removeFromShortlist,
  updateUser,
  byCreatedDesc,
} from '../models/users.js';
import { getSettings } from '../models/settings.js';

// Tamil Nadu 38 Official Districts
export const TAMIL_NADU_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Kanniyakumari',
  'Namakkal',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
  'Nilgiris',
];

// Case-insensitive "contains" match, like the old Mongo `$regex: new RegExp(term, 'i')`
// (but treating the user's input literally instead of as a regex pattern).
const contains = (value, term) => String(value ?? '').toLowerCase().includes(term.toLowerCase());
const equalsCI = (value, term) => String(value ?? '').toLowerCase() === term.toLowerCase();

const lockContacts = (profile, isPremium) => {
  if (!isPremium) {
    profile.phone = null;
    profile.additionalPhones = [];
    profile.email = null;
    profile.isContactLocked = true;
  } else {
    profile.isContactLocked = false;
  }
  return profile;
};

/**
 * Get Public Profiles (Strictly Gated to Verified Only)
 * Supports district, age range, marital status, education, and keyword queries.
 *
 * Firestore cannot do partial / case-insensitive matching, so only the exact filters
 * (isVerified, gender, isOverseas) run in Firestore and the rest are applied here.
 */
export const getProfiles = async (req, res) => {
  try {
    const {
      district,
      state,
      gender,
      ageMin,
      ageMax,
      maritalStatus,
      education,
      citizenship,
      isOverseas,
      searchId,
      workplace,
      location,
      nativePlace,
      page = 1,
      limit = 20,
    } = req.query;

    // Strict Gatekeeping: ONLY verified, unsuspended profiles are publicly accessible
    const equals = { isVerified: true };
    const filters = [];
    if (gender && gender !== 'all') {
      if (gender === 'overseas') equals.isOverseas = true;
      else equals.gender = gender;
    }
    if (isOverseas === 'true' || isOverseas === true || gender === 'overseas') {
      filters.push(
        (u) =>
          u.isOverseas === true ||
          (u.citizenship && u.citizenship !== 'Indian Citizen' && u.citizenship !== 'India') ||
          (u.countryOfResidence && u.countryOfResidence !== 'India' && u.countryOfResidence !== '')
      );
    }

    // 1. Search by Nikah ID
    if (searchId && searchId.trim()) {
      const term = searchId.trim();
      filters.push((u) => contains(u.nikahId, term));
    }

    // 3. District Filter (Supports Tamil and English district names)
    if (district && district !== 'all' && district !== 'அனைத்து ஊர்களும்') {
      const term = district.trim();
      filters.push((u) => equalsCI(u.district, term));
    }

    // 4. State Filter
    if (state && state !== 'all') {
      const term = state.trim();
      filters.push((u) => contains(u.state, term));
    }

    // 5. Age Range
    if (ageMin) filters.push((u) => Number(u.age) >= Number(ageMin));
    if (ageMax) filters.push((u) => Number(u.age) <= Number(ageMax));

    // 6-8. Marital status, education, workplace keyword filters
    const keywordFilters = {
      maritalStatus: maritalStatus !== 'அனைத்தும்' ? maritalStatus : null,
      education: education !== 'அனைத்தும்' ? education : null,
      workplace,
    };
    for (const [field, raw] of Object.entries(keywordFilters)) {
      if (raw && raw !== 'all' && raw.trim()) {
        const term = raw.trim();
        filters.push((u) => contains(u[field], term));
      }
    }

    // 9. Citizenship Filter (Matches citizenship or country of residence)
    if (citizenship && citizenship !== 'all' && citizenship.trim()) {
      const cTerm = citizenship.trim();
      filters.push((u) => contains(u.citizenship, cTerm) || contains(u.countryOfResidence, cTerm));
    }

    // 10. Native Location / Native Place Filter (typable keyword)
    const locTerm = (nativePlace || location || '').trim();
    if (locTerm) {
      filters.push((u) => contains(u.location, locTerm) || contains(u.nativePlace, locTerm) || contains(u.district, locTerm));
    }

    const matched = (await findUsers(equals))
      .filter((u) => filters.every((f) => f(u)))
      .sort(byCreatedDesc);

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;
    const profiles = matched.slice(skip, skip + limitNum).map((u) => {
      if (u.kycDocument) delete u.kycDocument.filename;
      return u;
    });

    res.json({
      success: true,
      count: profiles.length,
      total: matched.length,
      currentPage: pageNum,
      totalPages: Math.ceil(matched.length / limitNum),
      profiles,
    });
  } catch (err) {
    console.error('[Get Profiles Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve matrimonial profiles.',
    });
  }
};

/**
 * Get Single Profile Detailed View
 * Protected by viewLimitMiddleware (logs view and enforces 5 profiles/month on free tier)
 */
export const getProfileById = async (req, res) => {
  try {
    const viewer = req.user;
    const profile = req.targetProfile || (await findUserByIdOrNikahId(req.params.id));
    const viewStats = req.viewStats;

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const profileJson = { ...profile };
    delete profileJson.kycDocument; // Never leak raw document details

    // Strict Contact Access Gating:
    // With free tier, Contact details cannot be accessed.
    // If upgraded to premium (or admin, or viewing own profile), contact details can be accessed.
    const isSelf = viewer && (viewer._id === profile._id || viewer.nikahId === profile.nikahId);
    const isPremium =
      viewer && (viewer.role === 'admin' || viewer.subscriptionStatus === 'premium' || isSelf);

    lockContacts(profileJson, isPremium);

    res.json({
      success: true,
      profile: profileJson,
      viewStats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error loading profile details.',
    });
  }
};

/**
 * Get User's Chosen / Shortlisted Profiles
 * GET /api/profiles/my-shortlist
 */
export const getMyShortlist = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isPremium = user.subscriptionStatus === 'premium' || user.role === 'admin';
    const chosenList = await getUsersByIds(user.shortlistedProfiles || []);
    const settings = await getSettings();
    const FREE_CHOSEN_LIMIT = Number(settings?.freeTierLimits?.maxShortlistProfiles ?? 3);

    // Filter out contacts if viewer is not premium
    const sanitizedProfiles = chosenList.map((p) => {
      delete p.kycDocument;
      return lockContacts(p, isPremium);
    });

    res.json({
      success: true,
      count: sanitizedProfiles.length,
      limit: isPremium ? null : FREE_CHOSEN_LIMIT,
      isPremium,
      canChooseMore: isPremium || sanitizedProfiles.length < FREE_CHOSEN_LIMIT,
      profiles: sanitizedProfiles,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chosen profiles.',
    });
  }
};

/**
 * Toggle Shortlist / Choose Profile
 * POST /api/profiles/shortlist/toggle/:id
 */
export const toggleShortlist = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Please log in to choose profiles.' });
    }

    const target = await findUserByIdOrNikahId(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    const shortlist = user.shortlistedProfiles || [];
    const isPremium = user.subscriptionStatus === 'premium' || user.role === 'admin';
    const settings = await getSettings();

    if (settings?.features?.shortlistAccess === false && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Profile choosing / shortlisting feature is currently disabled by administrator.',
      });
    }

    const FREE_CHOSEN_LIMIT = Number(settings?.freeTierLimits?.maxShortlistProfiles ?? 3);

    if (shortlist.includes(target._id)) {
      // Remove from shortlist
      await removeFromShortlist(user._id, target._id);
      const count = shortlist.length - 1;

      return res.json({
        success: true,
        action: 'removed',
        isShortlisted: false,
        count,
        limit: isPremium ? null : FREE_CHOSEN_LIMIT,
        message: `Profile ${target.nikahId} removed from chosen list.`,
      });
    }

    // Attempting to add a new profile to chosen list
    if (!isPremium && shortlist.length >= FREE_CHOSEN_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        limit: FREE_CHOSEN_LIMIT,
        count: shortlist.length,
        message: `With free tier, you can choose only up to ${FREE_CHOSEN_LIMIT} profiles. Upgrade to Premium to choose unlimited profiles!`,
        upgradeRequired: true,
      });
    }

    await addToShortlist(user._id, target._id);

    res.json({
      success: true,
      action: 'added',
      isShortlisted: true,
      count: shortlist.length + 1,
      limit: isPremium ? null : FREE_CHOSEN_LIMIT,
      message: `Profile ${target.nikahId} added to your chosen list!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating chosen profiles.',
    });
  }
};

/**
 * Get Available Districts and Profile Counts
 */
export const getDistrictsSummary = async (req, res) => {
  try {
    const tally = {};
    (await findUsers({ isVerified: true }))
      .filter((u) => u.isSuspended !== true)
      .forEach((u) => {
        tally[u.district] = (tally[u.district] || 0) + 1;
      });
    const counts = Object.entries(tally)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      districts: TAMIL_NADU_DISTRICTS,
      counts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch districts.',
    });
  }
};

/**
 * Get Featured Profiles for the Running Marquee Bar
 * GET /api/profiles/featured-marquee
 */
export const getFeaturedMarqueeProfiles = async (req, res) => {
  try {
    const settings = await getSettings();
    const marqueeConfig = settings?.featuredMarquee || {
      enabled: true,
      price: 299,
      durationDays: 15,
      visibleFields: {
        photo: true,
        nikahId: true,
        name: true,
        age: true,
        location: true,
        education: true,
        occupation: true,
        monthlyIncome: false,
        height: false,
        maritalStatus: false,
      },
    };

    if (marqueeConfig.enabled === false) {
      return res.json({
        success: true,
        enabled: false,
        settings: marqueeConfig,
        profiles: [],
      });
    }

    // Only fetch users who have paid/activated featured status
    const featuredUsers = await findUsers({ isFeatured: true });
    const now = new Date();

    const activeFeatured = [];

    for (const u of featuredUsers) {
      if (u.isSuspended) continue;
      const isFeatureActive =
        u.isFeatured === true &&
        (!u.featuredUntil || new Date(u.featuredUntil) > now);

      if (isFeatureActive) {
        activeFeatured.push({ ...u, isFeaturedBadge: true });
      }
    }

    activeFeatured.sort(byCreatedDesc);

    // Only those profiles who actually paid / have active featured status are visible
    const profiles = activeFeatured;

    res.json({
      success: true,
      enabled: true,
      settings: marqueeConfig,
      profiles,
    });
  } catch (err) {
    console.error('[getFeaturedMarqueeProfiles Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured marquee profiles.',
    });
  }
};

/**
 * Feature current user's profile for the running bar
 * POST /api/profiles/feature-me
 */
export const featureMyProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Profile promotion in marquee requires payment via Cashfree.',
      });
    }

    const settings = await getSettings();
    const durationDays = Number(settings?.featuredMarquee?.durationDays || 15);
    const featuredUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await updateUser(user, {
      isFeatured: true,
      featuredUntil,
    });

    res.json({
      success: true,
      message: 'Alhamdulillah! Your profile has been featured in the Running Marquee Bar successfully.',
      isFeatured: true,
      featuredUntil,
      durationDays,
    });
  } catch (err) {
    console.error('[featureMyProfile Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to feature profile.',
    });
  }
};

