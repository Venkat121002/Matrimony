import User from '../models/User.js';

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

/**
 * Get Public Profiles (Strictly Gated to Verified Only)
 * Supports district, age range, marital status, education, and keyword queries
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
    const query = {
      isVerified: true,
      isSuspended: { $ne: true },
    };

    // 1. Search by Nikah ID
    if (searchId && searchId.trim()) {
      query.nikahId = { $regex: new RegExp(searchId.trim(), 'i') };
    }

    // 2. Gender / Overseas Filter
    if (gender && gender !== 'all') {
      if (gender === 'overseas') {
        query.isOverseas = true;
      } else {
        query.gender = gender;
      }
    }

    if (isOverseas === 'true' || isOverseas === true) {
      query.isOverseas = true;
    }

    // 3. District Filter (Supports Tamil and English district names)
    if (district && district !== 'all' && district !== 'அனைத்து ஊர்களும்') {
      query.district = { $regex: new RegExp(`^${district.trim()}$`, 'i') };
    }

    // 4. State Filter
    if (state && state !== 'all') {
      query.state = { $regex: new RegExp(state.trim(), 'i') };
    }

    // 5. Age Range Operator
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = Number(ageMin);
      if (ageMax) query.age.$lte = Number(ageMax);
    }

    // 6. Marital Status Filter
    if (maritalStatus && maritalStatus !== 'all' && maritalStatus !== 'அனைத்தும்') {
      query.maritalStatus = { $regex: new RegExp(maritalStatus.trim(), 'i') };
    }

    // 7. Education Filter
    if (education && education !== 'all' && education !== 'அனைத்தும்') {
      query.education = { $regex: new RegExp(education.trim(), 'i') };
    }

    // 8. Citizenship Filter
    if (citizenship && citizenship !== 'all') {
      query.citizenship = { $regex: new RegExp(citizenship.trim(), 'i') };
    }

    // 9. Workplace Filter (typable keyword)
    if (workplace && workplace.trim()) {
      query.workplace = { $regex: new RegExp(workplace.trim(), 'i') };
    }

    // 10. Native Location / Native Place Filter (typable keyword)
    const locTerm = (nativePlace || location || '').trim();
    if (locTerm) {
      const reg = new RegExp(locTerm, 'i');
      query.$or = [{ location: reg }, { nativePlace: reg }, { district: reg }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const profiles = await User.find(query)
      .select('-password -kycDocument.filename')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: profiles.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
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
    const profile = req.targetProfile;
    const viewStats = req.viewStats;
    const viewer = req.user;

    // User data is already verified & fetched by viewLimitMiddleware
    const profileJson = profile.toObject();
    delete profileJson.password;
    delete profileJson.kycDocument; // Never leak raw document details

    // Strict Contact Access Gating:
    // With free tier, Contact details cannot be accessed.
    // If upgraded to premium (or admin, or viewing own profile), contact details can be accessed.
    const isSelf =
      viewer &&
      (viewer._id?.toString() === profile._id?.toString() ||
        viewer.nikahId === profile.nikahId);
    const isPremium =
      viewer &&
      (viewer.role === 'admin' ||
        viewer.subscriptionStatus === 'premium' ||
        isSelf);

    if (!isPremium) {
      profileJson.phone = null;
      profileJson.additionalPhones = [];
      profileJson.email = null;
      profileJson.isContactLocked = true;
    } else {
      profileJson.isContactLocked = false;
    }

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
    const viewer = req.user;
    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(viewer._id).populate({
      path: 'shortlistedProfiles',
      select: '-password -kycDocument',
    });

    const isPremium = user.subscriptionStatus === 'premium' || user.role === 'admin';
    const chosenList = user.shortlistedProfiles || [];
    const FREE_CHOSEN_LIMIT = 3;

    // Filter out contacts if viewer is not premium
    const sanitizedProfiles = chosenList.map((p) => {
      const pObj = p.toObject ? p.toObject() : p;
      if (!isPremium) {
        pObj.phone = null;
        pObj.additionalPhones = [];
        pObj.email = null;
        pObj.isContactLocked = true;
      } else {
        pObj.isContactLocked = false;
      }
      return pObj;
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
    const viewer = req.user;
    const { id } = req.params;

    if (!viewer) {
      return res.status(401).json({ success: false, message: 'Please log in to choose profiles.' });
    }

    const user = await User.findById(viewer._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Resolve target user
    let target = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      target = await User.findById(id);
    } else {
      target = await User.findOne({ nikahId: id });
    }

    if (!target) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    if (!user.shortlistedProfiles) {
      user.shortlistedProfiles = [];
    }

    const targetIdStr = target._id.toString();
    const existingIndex = user.shortlistedProfiles.findIndex(
      (pid) => pid.toString() === targetIdStr
    );

    const isPremium = user.subscriptionStatus === 'premium' || user.role === 'admin';
    const FREE_CHOSEN_LIMIT = 3;

    if (existingIndex > -1) {
      // Remove from shortlist
      user.shortlistedProfiles.splice(existingIndex, 1);
      await user.save();

      return res.json({
        success: true,
        action: 'removed',
        isShortlisted: false,
        count: user.shortlistedProfiles.length,
        limit: isPremium ? null : FREE_CHOSEN_LIMIT,
        message: `Profile ${target.nikahId} removed from chosen list.`,
      });
    }

    // Attempting to add a new profile to chosen list
    if (!isPremium && user.shortlistedProfiles.length >= FREE_CHOSEN_LIMIT) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        limit: FREE_CHOSEN_LIMIT,
        count: user.shortlistedProfiles.length,
        message: `With free tier, you can choose only up to ${FREE_CHOSEN_LIMIT} profiles. Upgrade to Premium to choose unlimited profiles!`,
        upgradeRequired: true,
      });
    }

    user.shortlistedProfiles.push(target._id);
    await user.save();

    res.json({
      success: true,
      action: 'added',
      isShortlisted: true,
      count: user.shortlistedProfiles.length,
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
    const counts = await User.aggregate([
      { $match: { isVerified: true, isSuspended: { $ne: true } } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

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
