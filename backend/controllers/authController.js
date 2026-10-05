import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ProfileView from '../models/ProfileView.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { notifyMatchingPremiumUsers } from '../services/matchingService.js';

// Helper to generate JWT
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'tamil_nikah_jwt_secret_key_2026';
  return jwt.sign(
    { id: user._id, role: user.role, nikahId: user.nikahId },
    secret,
    { expiresIn: '30d' }
  );
};

// Generate strictly numerical User ID (numbers only, no TN- or alphabetic characters)
const generateNikahId = async () => {
  const allUsers = await User.find({}, { nikahId: 1 }).lean();
  let maxId = 100000;
  for (const u of allUsers) {
    if (u.nikahId) {
      const numOnly = parseInt(String(u.nikahId).replace(/\D/g, ''), 10);
      if (!isNaN(numOnly) && numOnly > maxId) {
        maxId = numOnly;
      }
    }
  }
  let nextId = maxId + 1;
  while (await User.findOne({ nikahId: String(nextId) })) {
    nextId += 1;
  }
  return String(nextId);
};

/**
 * Register New User (Single-Page Form Submission with KYC Document)
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      fullNameEn,
      nameEn,
      email,
      password,
      phone,
      additionalPhones,
      gender,
      age,
      maritalStatus,
      education,
      occupation,
      location,
      district,
      state = 'Tamil Nadu',
      language,
      income,
      monthlyIncome,
      incomeNum,
      height,
      heightNum,
      complexion,
      properties,
      property,
      description,
      bio,
      publisherName,
      publisherRelationship,
      declarationAgreed,
      workplace,
      nativePlace,
      currentAddress,
      livingYears,
      requirement,
      fatherName,
      fatherAge,
      fatherOccupation,
      motherName,
      motherAge,
      siblingsCount,
      elderSister,
      youngerSister,
      elderBrother,
      youngerBrother,
      brideWorkStatus,
      groomWorkPreference,
      isOverseas,
      citizenship,
      countryOfResidence,
    } = req.body;

    const resolvedName = (name || fullName || '').trim();
    const resolvedNameEn = (nameEn || fullNameEn || '').trim();
    if (!resolvedName && !resolvedNameEn) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    const cleanPhone = (phone || '').trim();
    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Process additional phones if any
    let parsedAdditionalPhones = [];
    if (additionalPhones) {
      if (Array.isArray(additionalPhones)) {
        parsedAdditionalPhones = additionalPhones.map((p) => String(p).trim()).filter(Boolean);
      } else if (typeof additionalPhones === 'string' && additionalPhones.trim()) {
        try {
          const parsed = JSON.parse(additionalPhones);
          parsedAdditionalPhones = Array.isArray(parsed)
            ? parsed.map((p) => String(p).trim()).filter(Boolean)
            : [additionalPhones.trim()];
        } catch {
          parsedAdditionalPhones = additionalPhones
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        }
      }
    }

    // Fallback email if omitted
    const resolvedEmail = email && email.trim()
      ? email.toLowerCase().trim()
      : `${cleanPhone.replace(/\D/g, '')}@tamilnikah.com`;

    // Check if user already exists with this phone or email
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const last10Digits = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;

    const phoneCheckConditions = [
      { phone: cleanPhone },
      { phone: cleanPhone.replace(/\s+/g, '') },
    ];

    if (last10Digits.length === 10) {
      const phoneVars = [
        last10Digits,
        `+91${last10Digits}`,
        `+91 ${last10Digits}`,
        `+91-${last10Digits}`,
        `0${last10Digits}`,
        `91${last10Digits}`,
      ];
      phoneVars.forEach((pv) => {
        phoneCheckConditions.push({ phone: pv });
        phoneCheckConditions.push({ additionalPhones: pv });
      });
    }

    if (resolvedEmail && !resolvedEmail.endsWith('@tamilnikah.com')) {
      phoneCheckConditions.push({ email: resolvedEmail });
    }

    const existingUser = await User.findOne({
      $or: phoneCheckConditions,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists.',
      });
    }

    const nikahId = await generateNikahId();

    // Process uploaded photos (up to 3)
    let photoUrls = [];
    if (req.files && req.files['photos']) {
      photoUrls = req.files['photos'].map((f) => `/uploads/media/${f.filename}`);
    } else if (req.body.photos) {
      if (Array.isArray(req.body.photos)) {
        photoUrls = req.body.photos;
      } else if (typeof req.body.photos === 'string' && req.body.photos.startsWith('[')) {
        try {
          photoUrls = JSON.parse(req.body.photos);
        } catch {
          photoUrls = [req.body.photos];
        }
      } else if (typeof req.body.photos === 'string') {
        photoUrls = [req.body.photos];
      }
    }

    // Process uploaded optional audio clip
    let audioClipData = {
      url: '',
      filename: '',
      originalName: '',
      mimetype: '',
      size: 0,
    };
    if (req.files && req.files['audioClip'] && req.files['audioClip'][0]) {
      const audioFile = req.files['audioClip'][0];
      audioClipData = {
        url: `/uploads/media/${audioFile.filename}`,
        filename: audioFile.filename,
        originalName: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size,
        uploadedAt: new Date(),
      };
    }

    // Publisher details
    const publisher = {
      name: (publisherName || resolvedName).trim(),
      relationship: (publisherRelationship || 'Self').trim(),
    };

    // Location & District fallback
    const resolvedDistrict = (location || district || 'Chennai').trim();
    const resolvedLocation = (location || district || '').trim();

    // Income & Properties
    const resolvedIncome = (income || monthlyIncome || '').trim();
    const resolvedProperty = (properties || property || '').trim();
    const resolvedDescription = (description || bio || '').trim();

    // Construct new user with direct active status (KYC removed entirely)
    const newUser = new User({
      nikahId,
      fullName: resolvedName || resolvedNameEn,
      fullNameEn: resolvedNameEn || resolvedName,
      email: resolvedEmail,
      password,
      phone: cleanPhone,
      additionalPhones: parsedAdditionalPhones,
      gender: gender || 'groom',
      age: Number(age) || 25,
      maritalStatus: maritalStatus || 'Un married',
      education: education || '',
      occupation: occupation || '',
      location: resolvedLocation,
      district: resolvedDistrict,
      state: state || 'Tamil Nadu',
      language: language || 'Tamil-Muslim',
      monthlyIncome: resolvedIncome,
      incomeNum: Number(incomeNum) || 0,
      height: height || '5.6 அடி',
      heightNum: Number(heightNum) || 5.6,
      complexion: complexion || 'மாநிறம்',
      property: resolvedProperty,
      description: resolvedDescription,
      bio: resolvedDescription,
      workplace: workplace || '',
      nativePlace: nativePlace || resolvedLocation,
      currentAddress: currentAddress || '',
      livingYears: livingYears || '',
      requirement: requirement || '',

      photos: photoUrls,
      avatar: photoUrls[0] || '',
      audioClip: audioClipData,

      publisher,
      declarationAgreed: declarationAgreed === 'true' || declarationAgreed === true,
      minimumActiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

      familyDetails: {
        fatherName: fatherName || '',
        fatherAge: Number(fatherAge) || 55,
        fatherOccupation: fatherOccupation || '',
        motherName: motherName || '',
        motherAge: Number(motherAge) || 50,
        siblingsCount: Number(siblingsCount) || 0,
        siblingDetails: {
          elderSister: elderSister || 'இல்லை',
          youngerSister: youngerSister || 'இல்லை',
          elderBrother: elderBrother || 'இல்லை',
          youngerBrother: youngerBrother || 'இல்லை',
        },
      },

      workPreferences: {
        brideWorkStatus: brideWorkStatus || 'will_work',
        groomWorkPreference: groomWorkPreference || 'working_bride',
      },

      isOverseas: Boolean(isOverseas === 'true' || isOverseas === true),
      citizenship: citizenship || 'Indian Citizen',
      countryOfResidence: countryOfResidence || 'India',

      // Profile starts as pending until admin approves it
      isVerified: false,
      verificationStatus: 'pending',

      // Subscription defaults: 1-Month Free Trial
      subscriptionStatus: 'free_trial',
      trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monthlyViewsCount: 0,
    });

    await newUser.save();

    // Trigger transactional welcome email in background if valid email
    if (resolvedEmail && !resolvedEmail.endsWith('@tamilnikah.com')) {
      sendWelcomeEmail(newUser).catch((err) =>
        console.error('[Email Worker] Welcome email failure:', err.message)
      );
    }

    // Trigger match recommendation emails to suitable Premium members in background
    notifyMatchingPremiumUsers(newUser).catch((err) =>
      console.error('[Match Worker] Failed to send match recommendations:', err.message)
    );

    const token = generateToken(newUser);

    // Return sanitized user object
    const userJson = newUser.toObject();
    delete userJson.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your profile is now registered.',
      token,
      user: userJson,
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during registration.',
    });
  }
};

/**
 * Login User
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone/email and password.',
      });
    }

    const cleanId = String(identifier).trim();
    const idNoSpaces = cleanId.replace(/\s+/g, '');
    const nikahClean = cleanId.toUpperCase().replace(/\s+/g, '');
    const digits = cleanId.replace(/\D/g, '');

    const orConditions = [
      { email: cleanId.toLowerCase() },
      { email: idNoSpaces.toLowerCase() },
      { nikahId: cleanId.toUpperCase() },
      { nikahId: nikahClean },
      { phone: cleanId },
      { phone: idNoSpaces },
      { additionalPhones: cleanId },
      { additionalPhones: idNoSpaces },
    ];

    // If candidate entered Nikah ID without dash (e.g. TN1025)
    if (/^[A-Za-z]{2}\d+$/.test(nikahClean)) {
      const withHyphen = nikahClean.slice(0, 2) + '-' + nikahClean.slice(2);
      orConditions.push({ nikahId: withHyphen });
    }

    // Phone variations if digits present
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      const variations = [
        last10,
        `+91${last10}`,
        `+91 ${last10}`,
        `+91-${last10}`,
        `0${last10}`,
        `91${last10}`,
      ];
      variations.forEach((v) => {
        orConditions.push({ phone: v });
        orConditions.push({ additionalPhones: v });
      });
    } else if (digits.length > 0) {
      orConditions.push({ phone: digits });
      orConditions.push({ additionalPhones: digits });
    }

    // Search by email, phone, additionalPhones, or Nikah ID
    const user = await User.findOne({
      $or: orConditions,
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended: ${user.suspensionReason || 'Contact support'}`,
      });
    }

    user.checkTrialStatus();
    await user.save();

    const token = generateToken(user);
    const userJson = user.toObject();
    delete userJson.password;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userJson,
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * Get Current Authenticated User (with monthly profile view counters)
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const viewsUsed = await ProfileView.countDocuments({
      viewerId: user._id,
      monthYear,
    });

    const userJson = user.toObject();
    userJson.viewsStats = {
      viewsUsed,
      viewsRemaining: user.subscriptionStatus === 'premium' ? 9999 : Math.max(0, 5 - viewsUsed),
      monthlyLimit: 5,
      isPremium: user.subscriptionStatus === 'premium',
      trialExpiresAt: user.trialExpiresAt,
      isTrialExpired: user.subscriptionStatus === 'free_trial' && user.trialExpiresAt < now,
    };

    res.json({
      success: true,
      user: userJson,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user details.',
    });
  }
};

/**
 * Re-upload / Update KYC Document (if rejected)
 */
export const uploadKYC = async (req, res) => {
  try {
    const user = req.user;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a clear document image or PDF.',
      });
    }

    user.kycDocument = {
      docType: ['Aadhaar', 'PAN', 'Passport'].includes(documentType) ? documentType : 'Aadhaar',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      rejectionReason: '',
    };
    user.verificationStatus = 'pending';
    user.isVerified = false;

    await user.save();

    res.json({
      success: true,
      message: 'Identity document uploaded successfully. Awaiting verification.',
      kycDocument: user.kycDocument,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error uploading KYC document.',
    });
  }
};

// Update current user profile
export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // List of allowed fields to update
    const allowedFields = [
      'fullName', 'fullNameEn', 'dateOfBirth', 'age', 'gender', 'maritalStatus', 'maritalStatusEn',
      'height', 'heightEn', 'weight', 'weightEn', 'complexion', 'complexionEn', 'language', 'motherTongue', 'motherTongueEn',
      'location', 'nativePlace', 'nativePlaceEn', 'district', 'state', 'stateEn', 'citizenship', 'citizenshipEn',
      'workplace', 'workplaceEn',
      'education', 'educationEn', 'occupation', 'profession', 'professionEn', 'monthlyIncome', 'income', 'incomeEn',
      'property', 'propertyEn', 'properties', 'propertiesEn', 'requirement', 'requirementEn', 'bio', 'description',
      'publisherName', 'publisherRelationship'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Sync location, nativePlace and district
    if (req.body.location !== undefined && req.body.location.trim()) {
      user.location = req.body.location.trim();
      user.district = req.body.location.trim();
      user.nativePlace = req.body.location.trim();
    } else if (req.body.district !== undefined && req.body.district.trim()) {
      user.location = req.body.district.trim();
      user.district = req.body.district.trim();
      user.nativePlace = req.body.district.trim();
    }

    if (req.body.workplace !== undefined) {
      user.workplace = req.body.workplace.trim();
    }

    if (req.body.description !== undefined) {
      user.description = req.body.description.trim();
      user.bio = req.body.description.trim();
    }

    // Additional phones
    if (req.body.additionalPhones !== undefined) {
      if (Array.isArray(req.body.additionalPhones)) {
        user.additionalPhones = req.body.additionalPhones.filter(Boolean);
      } else if (typeof req.body.additionalPhones === 'string') {
        try {
          user.additionalPhones = JSON.parse(req.body.additionalPhones).filter(Boolean);
        } catch {
          user.additionalPhones = req.body.additionalPhones.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    // Publisher details
    if (req.body.publisherName !== undefined || req.body.publisherRelationship !== undefined) {
      user.publisher = {
        name: req.body.publisherName !== undefined ? req.body.publisherName.trim() : (user.publisher?.name || user.fullName),
        relationship: req.body.publisherRelationship !== undefined ? req.body.publisherRelationship.trim() : (user.publisher?.relationship || 'Self'),
      };
    }

    // Handle existing photos that the user kept
    let currentPhotos = [];
    if (req.body.existingPhotos) {
      if (Array.isArray(req.body.existingPhotos)) {
        currentPhotos = req.body.existingPhotos;
      } else if (typeof req.body.existingPhotos === 'string' && req.body.existingPhotos.startsWith('[')) {
        try {
          currentPhotos = JSON.parse(req.body.existingPhotos);
        } catch {
          currentPhotos = [req.body.existingPhotos];
        }
      } else if (typeof req.body.existingPhotos === 'string') {
        currentPhotos = [req.body.existingPhotos];
      }
    } else {
      if (req.body.existingPhotos === '') {
        currentPhotos = [];
      } else if (req.body.existingPhotos === undefined && Object.keys(req.body).length > 0) {
        currentPhotos = user.photos || [];
      }
    }

    // Process uploaded photos
    if (req.files && req.files['photos']) {
      const newPhotoUrls = req.files['photos'].map((f) => `/uploads/media/${f.filename}`);
      currentPhotos = [...currentPhotos, ...newPhotoUrls];
    }
    
    user.photos = currentPhotos;

    // Process audio clip deletion
    if (req.body.deleteAudio === 'true') {
      user.audioClip = { url: '', filename: '', originalName: '', mimetype: '', size: 0 };
    }

    // Process uploaded audio clip
    if (req.files && req.files['audioClip'] && req.files['audioClip'][0]) {
      const audioFile = req.files['audioClip'][0];
      user.audioClip = {
        url: `/uploads/media/${audioFile.filename}`,
        filename: audioFile.filename,
        originalName: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size,
        uploadedAt: new Date(),
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        _id: user._id,
        nikahId: user.nikahId,
        fullName: user.fullName,
        fullNameEn: user.fullNameEn,
        phone: user.phone,
        additionalPhones: user.additionalPhones,
        email: user.email,
        gender: user.gender,
        age: user.age,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        maritalStatusEn: user.maritalStatusEn,
        language: user.language,
        location: user.location || user.district || user.nativePlace,
        district: user.district,
        nativePlace: user.nativePlace,
        workplace: user.workplace,
        height: user.height,
        education: user.education,
        occupation: user.occupation,
        profession: user.occupation,
        monthlyIncome: user.monthlyIncome,
        income: user.monthlyIncome,
        property: user.property,
        properties: user.property,
        description: user.description || user.bio,
        bio: user.description || user.bio,
        requirement: user.requirement,
        publisher: user.publisher,
        photos: user.photos,
        audioClip: user.audioClip,
        subscriptionStatus: user.subscriptionStatus,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        viewStats: {
          limit: user.viewLimit,
          used: user.viewsUsed,
          remaining: user.viewLimit - user.viewsUsed,
          isPremium: user.subscriptionStatus === 'premium',
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating profile.',
    });
  }
};
