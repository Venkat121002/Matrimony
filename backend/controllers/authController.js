import jwt from 'jsonwebtoken';
import {
  createUser,
  nextNikahId,
  findUserByIdentifiers,
  comparePassword,
  checkTrialStatus,
  updateUser,
  getUserById,
  setResetOtp,
  verifyResetOtp,
  checkResetOtpVerified,
  setUserPassword,
} from '../models/users.js';
import { countViewsInMonth, currentMonthYear } from '../models/profileViews.js';
import { getJwtSecret } from '../config/secrets.js';
import { sendWelcomeEmail, sendPasswordResetOtpEmail } from '../services/emailService.js';
import { notifyMatchingPremiumUsers } from '../services/matchingService.js';
import { sendWhatsAppOtp, createWhatsAppDirectLink } from '../services/whatsappService.js';

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, nikahId: user.nikahId },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
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
      workingYearsInTitleLocation,
      fatherName,
      fatherAge,
      fatherOccupation,
      motherName,
      motherAge,
      motherOccupation,
      siblings,
      siblingsCount,
      elderSister,
      youngerSister,
      elderBrother,
      youngerBrother,
      workPreference,
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

    const isCandidateOverseas = Boolean(isOverseas === 'true' || isOverseas === true);
    const rawCountryCode = (req.body.countryCode || '').trim();
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

    // Determine resolvedCountryCode and formatted full phone
    let resolvedCountryCode = rawCountryCode;
    let finalPhone = cleanPhone;
    if (cleanPhone.startsWith('+')) {
      finalPhone = cleanPhone;
      if (!resolvedCountryCode) {
        const match = cleanPhone.match(/^(\+\d{1,4})/);
        if (match) resolvedCountryCode = match[1];
      }
    } else if (rawCountryCode) {
      resolvedCountryCode = rawCountryCode.startsWith('+') ? rawCountryCode : `+${rawCountryCode}`;
      finalPhone = `${resolvedCountryCode} ${cleanPhone.replace(/^0+/, '')}`.trim();
    } else if (isCandidateOverseas) {
      resolvedCountryCode = '+65';
      finalPhone = `+65 ${cleanPhone.replace(/^0+/, '')}`.trim();
    } else {
      resolvedCountryCode = '+91';
      finalPhone = `+91 ${cleanPhone.replace(/^0+/, '')}`.trim();
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
      : `${finalPhone.replace(/\D/g, '')}@tamilnikah.com`;

    // Check if user already exists with this phone or email
    const phoneDigits = finalPhone.replace(/\D/g, '');
    const cleanPhoneDigits = cleanPhone.replace(/\D/g, '');
    const phoneVariants = [
      finalPhone,
      finalPhone.replace(/\s+/g, ''),
      cleanPhone,
      cleanPhone.replace(/\s+/g, ''),
    ];

    if (cleanPhoneDigits) {
      phoneVariants.push(cleanPhoneDigits);
    }
    if (phoneDigits) {
      phoneVariants.push(phoneDigits);
    }

    if (resolvedCountryCode) {
      const pureLocal = cleanPhone.replace(/^\+\d{1,4}\s*/, '').replace(/\D/g, '');
      if (pureLocal) {
        phoneVariants.push(pureLocal);
        phoneVariants.push(`${resolvedCountryCode}${pureLocal}`);
        phoneVariants.push(`${resolvedCountryCode} ${pureLocal}`);
      }
    }

    const last10Digits = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : '';
    if ((resolvedCountryCode === '+91' || !isCandidateOverseas) && last10Digits) {
      phoneVariants.push(
        last10Digits,
        `+91${last10Digits}`,
        `+91 ${last10Digits}`,
        `+91-${last10Digits}`,
        `0${last10Digits}`,
        `91${last10Digits}`
      );
    }

    const existingUser = await findUserByIdentifiers({
      phones: phoneVariants,
      emails: resolvedEmail && !resolvedEmail.endsWith('@tamilnikah.com') ? [resolvedEmail] : [],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists.',
      });
    }

    const nikahId = await nextNikahId();

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
    const resolvedState = isCandidateOverseas ? 'Overseas' : (state || 'Tamil Nadu');
    const resolvedLocation = (location || district || (isCandidateOverseas ? (countryOfResidence || citizenship || 'Singapore') : 'Chennai')).trim();
    const resolvedDistrict = isCandidateOverseas
      ? (district || `Overseas - ${citizenship || countryOfResidence || resolvedLocation}`).trim()
      : (location || district || 'Chennai').trim();

    // Income & Properties
    const resolvedIncome = (income || monthlyIncome || '').trim();
    const resolvedProperty = (properties || property || '').trim();
    const resolvedDescription = (description || bio || '').trim();

    // Process siblings list if provided
    let parsedSiblings = [];
    if (siblings) {
      if (Array.isArray(siblings)) {
        parsedSiblings = siblings;
      } else if (typeof siblings === 'string' && siblings.trim()) {
        try {
          const parsed = JSON.parse(siblings);
          if (Array.isArray(parsed)) parsedSiblings = parsed;
        } catch {
          parsedSiblings = [];
        }
      }
    }

    // Work preferences
    const candidateGender = gender || 'groom';
    const resolvedGroomPref = groomWorkPreference || (candidateGender === 'groom' ? workPreference : '') || 'need_working';
    const resolvedBrideStatus = brideWorkStatus || (candidateGender === 'bride' ? workPreference : '') || 'will_work';

    // Construct new user with direct active status (KYC removed entirely)
    const newUser = await createUser({
      nikahId,
      fullName: resolvedName || resolvedNameEn,
      fullNameEn: resolvedNameEn || resolvedName,
      email: resolvedEmail,
      password,
      phone: finalPhone,
      countryCode: resolvedCountryCode,
      additionalPhones: parsedAdditionalPhones,
      gender: candidateGender,
      age: Number(age) || 25,
      maritalStatus: maritalStatus || 'Un married',
      education: education || '',
      occupation: occupation || '',
      location: resolvedLocation,
      district: resolvedDistrict,
      state: resolvedState,
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
      workingYearsInTitleLocation: (workingYearsInTitleLocation || '').trim(),
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
        fatherName: (fatherName || '').trim(),
        fatherAge: Number(fatherAge) || 55,
        fatherOccupation: (fatherOccupation || '').trim(),
        motherName: (motherName || '').trim(),
        motherAge: Number(motherAge) || 50,
        motherOccupation: (motherOccupation || '').trim(),
        siblingsCount: parsedSiblings.length || Number(siblingsCount) || 0,
        siblings: parsedSiblings,
        siblingDetails: {
          elderSister: elderSister || 'இல்லை',
          youngerSister: youngerSister || 'இல்லை',
          elderBrother: elderBrother || 'இல்லை',
          youngerBrother: youngerBrother || 'இல்லை',
        },
      },

      workPreferences: {
        brideWorkStatus: resolvedBrideStatus,
        groomWorkPreference: resolvedGroomPref,
        preferenceOption: (workPreference || '').trim(),
        preferenceText: (candidateGender === 'groom' ? resolvedGroomPref : resolvedBrideStatus),
      },

      isOverseas: isCandidateOverseas,
      citizenship: (citizenship || (isCandidateOverseas ? 'Other Foreign Citizen' : 'Indian Citizen')).trim(),
      countryOfResidence: (countryOfResidence || (isCandidateOverseas ? 'Singapore' : 'India')).trim(),

      // Profile starts as pending until admin approves it
      isVerified: false,
      verificationStatus: 'pending',

      // Subscription defaults: 1-Month Free Trial
      subscriptionStatus: 'free_trial',
      trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      monthlyViewsCount: 0,
    });

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

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your profile is now registered.',
      token,
      user: newUser,
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

    const emails = [cleanId.toLowerCase(), idNoSpaces.toLowerCase()];
    const nikahIds = [cleanId.toUpperCase(), nikahClean];
    const phones = [cleanId, idNoSpaces];

    // If candidate entered Nikah ID without dash (e.g. TN1025)
    if (/^[A-Za-z]{2}\d+$/.test(nikahClean)) {
      nikahIds.push(nikahClean.slice(0, 2) + '-' + nikahClean.slice(2));
    }

    if (cleanId.startsWith('+')) {
      phones.push(`+${digits}`);
      phones.push(cleanId);
    }

    // Phone variations if digits present
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      phones.push(last10, `+91${last10}`, `+91 ${last10}`, `+91-${last10}`, `0${last10}`, `91${last10}`);
    }
    if (digits.length > 0) {
      phones.push(digits);
      phones.push(`+${digits}`);
    }

    // Search by email, phone, additionalPhones, or Nikah ID
    const user = await findUserByIdentifiers({ emails, phones, nikahIds }, { withPassword: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await comparePassword(user, password);
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

    const previousStatus = user.subscriptionStatus;
    if (checkTrialStatus(user) !== previousStatus) {
      await updateUser(user, { subscriptionStatus: user.subscriptionStatus });
    }

    const token = generateToken(user);
    const { password: _pw, ...userJson } = user;

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
    const viewsUsed = await countViewsInMonth(user._id, currentMonthYear(now));

    const userJson = { ...user };
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

    await updateUser(user, {
      kycDocument: {
        docType: ['Aadhaar', 'PAN', 'Passport'].includes(documentType) ? documentType : 'Aadhaar',
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
        rejectionReason: '',
      },
      verificationStatus: 'pending',
      isVerified: false,
    });

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
    const user = await getUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // List of allowed fields to update
    const allowedFields = [
      'fullName', 'fullNameEn', 'dateOfBirth', 'age', 'gender', 'maritalStatus', 'maritalStatusEn',
      'height', 'heightEn', 'weight', 'weightEn', 'complexion', 'complexionEn', 'language', 'motherTongue', 'motherTongueEn',
      'location', 'nativePlace', 'nativePlaceEn', 'district', 'state', 'stateEn', 'citizenship', 'citizenshipEn',
      'workplace', 'workplaceEn', 'workingYearsInTitleLocation', 'countryOfResidence', 'isOverseas',
      'education', 'educationEn', 'occupation', 'profession', 'professionEn', 'monthlyIncome', 'income', 'incomeEn',
      'property', 'propertyEn', 'properties', 'propertiesEn', 'requirement', 'requirementEn', 'bio', 'description',
      'publisherName', 'publisherRelationship', 'countryCode'
    ];

    allowedFields.forEach((field) => {
      // Only plain scalars are accepted (Firestore has no schema to cast/reject objects)
      const value = req.body[field];
      if (value !== undefined && ['string', 'number', 'boolean'].includes(typeof value)) {
        user[field] = value;
      }
    });
    if (req.body.isOverseas !== undefined) {
      user.isOverseas = req.body.isOverseas === 'true' || req.body.isOverseas === true;
    }
    if (req.body.age !== undefined && !Number.isNaN(Number(req.body.age))) {
      user.age = Number(req.body.age);
    }

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

    // Family Details update
    if (req.body.familyDetails) {
      try {
        const fam = typeof req.body.familyDetails === 'string' ? JSON.parse(req.body.familyDetails) : req.body.familyDetails;
        user.familyDetails = { ...(user.familyDetails || {}), ...fam };
      } catch (e) {}
    } else {
      user.familyDetails = user.familyDetails || {};
      if (req.body.fatherName !== undefined) user.familyDetails.fatherName = req.body.fatherName.trim();
      if (req.body.fatherAge !== undefined) user.familyDetails.fatherAge = Number(req.body.fatherAge) || user.familyDetails.fatherAge;
      if (req.body.fatherOccupation !== undefined) user.familyDetails.fatherOccupation = req.body.fatherOccupation.trim();
      if (req.body.motherName !== undefined) user.familyDetails.motherName = req.body.motherName.trim();
      if (req.body.motherAge !== undefined) user.familyDetails.motherAge = Number(req.body.motherAge) || user.familyDetails.motherAge;
      if (req.body.motherOccupation !== undefined) user.familyDetails.motherOccupation = req.body.motherOccupation.trim();
      if (req.body.siblings !== undefined) {
        try {
          const s = typeof req.body.siblings === 'string' ? JSON.parse(req.body.siblings) : req.body.siblings;
          if (Array.isArray(s)) {
            user.familyDetails.siblings = s;
            user.familyDetails.siblingsCount = s.length;
          }
        } catch (e) {}
      }
    }

    // Work Preferences update
    if (req.body.workPreferences) {
      try {
        const wp = typeof req.body.workPreferences === 'string' ? JSON.parse(req.body.workPreferences) : req.body.workPreferences;
        user.workPreferences = { ...(user.workPreferences || {}), ...wp };
      } catch (e) {}
    } else if (req.body.workPreference || req.body.brideWorkStatus || req.body.groomWorkPreference) {
      user.workPreferences = user.workPreferences || {};
      if (req.body.workPreference) user.workPreferences.preferenceOption = req.body.workPreference;
      if (req.body.brideWorkStatus) user.workPreferences.brideWorkStatus = req.body.brideWorkStatus;
      if (req.body.groomWorkPreference) user.workPreferences.groomWorkPreference = req.body.groomWorkPreference;
      if (req.body.workPreference) {
        if (user.gender === 'groom') user.workPreferences.groomWorkPreference = req.body.workPreference;
        if (user.gender === 'bride') user.workPreferences.brideWorkStatus = req.body.workPreference;
      }
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

    await updateUser(user, user);

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
        workingYearsInTitleLocation: user.workingYearsInTitleLocation || '',
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
        familyDetails: user.familyDetails,
        workPreferences: user.workPreferences,
        isOverseas: Boolean(user.isOverseas),
        citizenship: user.citizenship || 'Indian Citizen',
        countryOfResidence: user.countryOfResidence || 'India',
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

/**
 * 1. Forgot Password - Sends 6-digit OTP via Email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { identifier, email: providedEmail } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email, mobile number, or Nikah ID.',
      });
    }

    const cleanId = String(identifier).trim();
    const idNoSpaces = cleanId.replace(/\s+/g, '');
    const nikahClean = cleanId.toUpperCase().replace(/\s+/g, '');
    const digits = cleanId.replace(/\D/g, '');

    const emails = [cleanId.toLowerCase(), idNoSpaces.toLowerCase()];
    const nikahIds = [cleanId.toUpperCase(), nikahClean];
    const phones = [cleanId, idNoSpaces];

    if (/^[A-Za-z]{2}\d+$/.test(nikahClean)) {
      nikahIds.push(nikahClean.slice(0, 2) + '-' + nikahClean.slice(2));
    }
    if (cleanId.startsWith('+')) {
      phones.push(`+${digits}`);
      phones.push(cleanId);
    }
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      phones.push(last10, `+91${last10}`, `+91 ${last10}`, `+91-${last10}`, `0${last10}`, `91${last10}`);
    }
    if (digits.length > 0) {
      phones.push(digits);
      phones.push(`+${digits}`);
    }

    const user = await findUserByIdentifiers({ emails, phones, nikahIds });
    if (!user) {
      return res.json({
        success: false,
        message: 'No account found with this email, mobile number, or Nikah ID. Please check and try again.',
      });
    }

    // Prefer the profile email. Ask for one only when the profile has no real email.
    let targetEmail = user.email?.trim().toLowerCase();
    if (!targetEmail || targetEmail.endsWith('@tamilnikah.com')) {
      targetEmail = String(providedEmail || '').trim().toLowerCase();
    }
    if (!targetEmail) {
      return res.json({
        success: false,
        needsEmailInput: true,
        message: 'This profile does not have a registered email address. Enter an email address to receive the password reset OTP.',
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      return res.status(400).json({
        success: false,
        needsEmailInput: true,
        message: 'Please enter a valid email address to receive the password reset OTP.',
      });
    }

    // Save the recovery email only when the profile previously had no real email.
    if (!user.email || user.email.trim().toLowerCase().endsWith('@tamilnikah.com')) {
      user.email = targetEmail;
      await updateUser(user, user);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in user record
    await setResetOtp(user._id, otp, expiresAt);

    // Send via Email
    const mailResult = await sendPasswordResetOtpEmail(user, otp);
    if (!mailResult?.success && !mailResult?.mocked) {
      console.warn('[Forgot Password] Mailer error:', mailResult?.error);
      await setResetOtp(user._id, '', new Date(0));
      return res.status(502).json({
        success: false,
        message: 'Could not send the password reset email. Please try again later.',
      });
    }

    // Mask email for user privacy (e.g. a*****h@gmail.com)
    const [localPart, domainPart] = targetEmail.split('@');
    const maskedEmail =
      localPart.length > 2
        ? `${localPart.charAt(0)}${'*'.repeat(Math.max(3, Math.min(6, localPart.length - 2)))}${localPart.slice(-1)}@${domainPart || ''}`
        : `${localPart.charAt(0)}*@${domainPart || ''}`;

    res.json({
      success: true,
      message: `A 6-digit OTP verification code has been sent to your email (${maskedEmail}).`,
      userId: user._id,
      emailMasked: maskedEmail,
      emailSent: true,
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error sending password reset OTP.',
    });
  }
};

/**
 * 2. Verify Email OTP
 */
export const verifyResetOtpHandler = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.json({
        success: false,
        message: 'User ID and OTP are required.',
      });
    }

    const isValid = await verifyResetOtp(userId, String(otp).trim());
    if (!isValid) {
      return res.json({
        success: false,
        message: 'Invalid or expired OTP. Please check the code sent to your email and try again.',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You may now enter your new password.',
    });
  } catch (err) {
    console.error('[Verify OTP Error]:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP.',
    });
  }
};

/**
 * 3. Reset Password with verified OTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.json({
        success: false,
        message: 'User ID and new password are required.',
      });
    }

    if (String(newPassword).length < 6) {
      return res.json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Verify OTP state
    const isVerified = await checkResetOtpVerified(userId);
    if (!isVerified) {
      const isValid = await verifyResetOtp(userId, String(otp || '').trim());
      if (!isValid) {
        return res.json({
          success: false,
          message: 'OTP verification expired or invalid. Please request a new OTP.',
        });
      }
    }

    await setUserPassword(userId, String(newPassword));

    res.json({
      success: true,
      message: 'Password changed successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update password.',
    });
  }
};
