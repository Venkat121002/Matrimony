import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nikahId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    fullNameEn: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    resetOtp: {
      code: { type: String, default: '' },
      expiresAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    countryCode: {
      type: String,
      default: '+91',
      trim: true,
    },
    additionalPhones: [
      {
        type: String,
        trim: true,
      },
    ],
    gender: {
      type: String,
      enum: ['groom', 'bride'],
      required: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 80,
      index: true,
    },
    maritalStatus: {
      type: String,
      default: 'திருமணம் ஆகாதவர்',
      index: true,
    },
    education: {
      type: String,
      default: 'பட்டதாரி',
    },
    occupation: {
      type: String,
      default: 'தனியார் பணி',
    },
    workplace: {
      type: String,
      default: '',
    },
    monthlyIncome: {
      type: String,
      default: '45,000/',
    },
    incomeNum: {
      type: Number,
      default: 45000,
    },
    height: {
      type: String,
      default: '5.6 அடி',
    },
    heightNum: {
      type: Number,
      default: 5.6,
    },
    complexion: {
      type: String,
      default: 'மாநிறம்',
    },
    language: {
      type: String,
      default: 'தமிழ்-முஸ்லிம்',
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      index: true,
    },
    nativePlace: {
      type: String,
      default: '',
    },
    currentAddress: {
      type: String,
      default: '',
    },
    livingYears: {
      type: String,
      default: '5 ஆண்டுகள்',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    property: {
      type: String,
      default: 'சொந்த வீடு',
    },
    bio: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    requirement: {
      type: String,
      default: '',
    },
    photos: [
      {
        type: String,
      },
    ],
    audioClip: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimetype: { type: String, default: '' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now },
    },
    publisher: {
      name: { type: String, default: '', trim: true },
      relationship: { type: String, default: 'Self', trim: true },
    },
    declarationAgreed: {
      type: Boolean,
      default: false,
    },
    minimumActiveUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month non-removal period
    },

    // Work experience in title and location
    workingYearsInTitleLocation: {
      type: String,
      default: '',
    },

    // Family Details
    familyDetails: {
      fatherName: { type: String, default: '' },
      fatherAge: { type: Number, default: 55 },
      fatherOccupation: { type: String, default: '' },
      motherName: { type: String, default: '' },
      motherAge: { type: Number, default: 50 },
      motherOccupation: { type: String, default: '' },
      siblingsCount: { type: Number, default: 0 },
      siblings: [
        {
          name: { type: String, default: '' },
          relation: { type: String, default: 'brother' },
          maritalStatus: { type: String, default: 'திருமணம் ஆகாதவர்' },
        },
      ],
      siblingDetails: {
        elderSister: { type: String, default: 'இல்லை' },
        youngerSister: { type: String, default: 'இல்லை' },
        elderBrother: { type: String, default: 'இல்லை' },
        youngerBrother: { type: String, default: 'இல்லை' },
      },
    },

    // Work Preferences
    workPreferences: {
      brideWorkStatus: {
        type: String,
        default: 'will_work',
      },
      groomWorkPreference: {
        type: String,
        default: 'need_working',
      },
      preferenceOption: {
        type: String,
        default: '',
      },
      preferenceText: {
        type: String,
        default: '',
      },
    },

    // Overseas Details
    isOverseas: {
      type: Boolean,
      default: false,
      index: true,
    },
    citizenship: {
      type: String,
      default: 'Indian Citizen',
    },
    countryOfResidence: {
      type: String,
      default: 'India',
    },

    // Role & Authorization
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },

    // Verification Status (Requires admin verification before displaying on user side)
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    kycDocument: {
      docType: {
        type: String,
        enum: ['Aadhaar', 'PAN', 'Passport', 'Other'],
        default: 'Aadhaar',
      },
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now },
      verifiedAt: { type: Date },
      rejectionReason: { type: String, default: '' },
    },

    // 4. Subscription Control & Free Trial
    subscriptionStatus: {
      type: String,
      enum: ['free_trial', 'premium', 'expired'],
      default: 'free_trial',
      index: true,
    },
    trialExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    },
    premiumExpiresAt: {
      type: Date,
    },
    monthlyViewsCount: {
      type: Number,
      default: 0,
    },

    // Chosen / Shortlisted Profiles (Max 3 on free tier, Unlimited on premium)
    shortlistedProfiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Match recommendation flag to avoid duplicate notifications
    matchNotified: {
      type: Boolean,
      default: false,
    },

    // Account state
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },

    // Running Marquee Bar (Featured Profile)
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Passwords are hashed in models/mongo/users.js (createUser), shared with the Firestore driver.

// Compound indexes for performant searching
userSchema.index({ isVerified: 1, district: 1, gender: 1 });
userSchema.index({ isVerified: 1, age: 1 });

const User = mongoose.model('User', userSchema);
export default User;
