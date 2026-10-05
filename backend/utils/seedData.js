import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import SupportTicket from '../models/SupportTicket.js';
import { connectDB } from '../config/db.js';
import { getPrivateKYCDir } from '../middleware/uploadMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample placeholder KYC documents for admin queue testing
const createPlaceholderDocuments = () => {
  const dir = getPrivateKYCDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sampleFiles = [
    { name: 'kyc-sample-aadhaar.txt', content: 'GOVERNMENT OF INDIA - UNIQUE IDENTIFICATION AUTHORITY\nAadhaar Proof Sample for Demo User\nUID: XXXX-XXXX-9842\nName: Mohamed Riaz\nDOB: 15/08/1997\nAddress: Anna Nagar, Chennai, Tamil Nadu' },
    { name: 'kyc-sample-pan.txt', content: 'INCOME TAX DEPARTMENT - GOVT OF INDIA\nPAN Card Sample Verification Proof\nPermanent Account Number: BXYZR1234M\nName: Syed Ibrahim\nFather: Kamaludeen' },
    { name: 'kyc-sample-passport.txt', content: 'REPUBLIC OF INDIA - PASSPORT\nPassport Number: Z8942157\nGiven Name: Fathima Zehra\nPlace of Issue: Tiruchirappalli' },
  ];

  sampleFiles.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, file.content, 'utf8');
    }
  });
};

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Resetting sample data...');

    createPlaceholderDocuments();

    await User.deleteMany({});
    await SupportTicket.deleteMany({});

    // 1. Create Default Administrator
    const adminUser = new User({
      nikahId: 'TN-ADMIN-01',
      fullName: 'Super Admin',
      fullNameEn: 'Super Admin',
      email: 'admin@tamilnikah.com',
      password: 'admin123',
      phone: '9876543210',
      gender: 'groom',
      age: 35,
      district: 'Chennai',
      state: 'Tamil Nadu',
      role: 'admin',
      isVerified: true,
      verificationStatus: 'verified',
      subscriptionStatus: 'premium',
    });
    await adminUser.save();
    console.log('✓ Admin user seeded: admin@tamilnikah.com / admin123');

    // 2. Seed Verified Profiles across Tamil Nadu districts
    const verifiedUsersData = [
      {
        nikahId: 'TN-1001',
        fullName: 'முஹம்மது அர்ஷத்',
        fullNameEn: 'Mohamed Arshath',
        email: 'arshath@example.com',
        password: 'User@123',
        phone: '9171896621',
        gender: 'groom',
        age: 27,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.E (Computer Science)',
        occupation: 'Software Engineer',
        workplace: 'MNC, Guindy, Chennai',
        monthlyIncome: '85,000/',
        incomeNum: 85000,
        height: '5.9 அடி',
        heightNum: 5.9,
        complexion: 'மாநிறம்',
        district: 'Chennai',
        state: 'Tamil Nadu',
        nativePlace: 'சென்னை',
        currentAddress: 'அண்ணா நகர், சென்னை',
        livingYears: '15 ஆண்டுகள்',
        property: 'சொந்த அடுக்குமாடி குடியிருப்பு',
        bio: 'மரியாதையான குடும்பம், தொழுகை உள்ள மணமகள் தேவை.',
        requirement: 'மார்க்கப்பற்றுள்ள பட்டதாரி பெண் தேவை.',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'premium',
        familyDetails: {
          fatherName: 'காதர் பாஷா',
          fatherOccupation: 'ஓய்வு பெற்ற அரசு அதிகாரி',
          motherName: 'ஆயிஷா பேகம்',
          motherAge: 52,
          siblingsCount: 2,
          siblingDetails: { elderSister: '1 (திருமணமானவர்)', youngerSister: 'இல்லை', elderBrother: 'இல்லை', youngerBrother: '1' }
        }
      },
      {
        nikahId: 'TN-1002',
        fullName: 'பாத்திமா ஷிபானா',
        fullNameEn: 'Fathima Shibana',
        email: 'fathima@example.com',
        password: 'User@123',
        phone: '9171896622',
        gender: 'bride',
        age: 24,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'M.Sc (Biochemistry)',
        occupation: 'ஆசிரியர் / விரிவுரையாளர்',
        workplace: 'மெட்ரிக் பள்ளி, மதுரை',
        monthlyIncome: '35,000/',
        incomeNum: 35000,
        height: '5.3 அடி',
        heightNum: 5.3,
        complexion: 'சிகப்பு',
        district: 'Madurai',
        state: 'Tamil Nadu',
        nativePlace: 'மதுரை',
        currentAddress: 'கே.கே நகர், மதுரை',
        livingYears: '20 ஆண்டுகள்',
        property: 'சொந்த வீடு மற்றும் நிலம்',
        bio: 'தொழுகையுள்ள நற்குணம் கொண்ட குடும்பம்.',
        requirement: 'சுயதொழில் அல்லது நல்ல உத்தியோகத்தில் உள்ள மார்க்க பற்றுள்ள மணமகன் தேவை.',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
        familyDetails: {
          fatherName: 'அப்துல் ரஹ்மான்',
          fatherOccupation: 'வணிகம் (ஜவுளி கடை)',
          motherName: 'மர்யம் பீவி',
          motherAge: 48,
          siblingsCount: 1,
          siblingDetails: { elderSister: 'இல்லை', youngerSister: 'இல்லை', elderBrother: '1', youngerBrother: 'இல்லை' }
        }
      },
      {
        nikahId: 'TN-1003',
        fullName: 'சையத் இப்ராஹிம்',
        fullNameEn: 'Syed Ibrahim',
        email: 'syed@example.com',
        password: 'User@123',
        phone: '9171896623',
        gender: 'groom',
        age: 29,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'MBA (Finance)',
        occupation: 'வங்கி மேலாளர் (Bank Manager)',
        workplace: 'தனியார் வங்கி, கோவை',
        monthlyIncome: '95,000/',
        incomeNum: 95000,
        height: '5.8 அடி',
        heightNum: 5.8,
        complexion: 'மாநிறம்-சிகப்பு',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        nativePlace: 'கோயம்புத்தூர்',
        currentAddress: 'ஆர்.எஸ்.புரம், கோயம்புத்தூர்',
        livingYears: '18 ஆண்டுகள்',
        property: 'சொந்த பங்களா வீடு',
        bio: 'அமைதியான சுபாவம், 5 வேளை தொழுகை பழக்கம்.',
        requirement: 'படித்த நல்ல குடும்பத்து பெண் தேவை.',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
      {
        nikahId: 'TN-1004',
        fullName: 'ஆயிஷா சித்தீகா',
        fullNameEn: 'Ayesha Siddiqa',
        email: 'ayesha@example.com',
        password: 'User@123',
        phone: '9171896624',
        gender: 'bride',
        age: 23,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.Com (CA)',
        occupation: 'அலுவலக நிர்வாகி',
        workplace: 'திருச்சி',
        monthlyIncome: '28,000/',
        incomeNum: 28000,
        height: '5.2 அடி',
        heightNum: 5.2,
        complexion: 'சிகப்பு',
        district: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        nativePlace: 'திருச்சிராப்பள்ளி',
        currentAddress: 'தென்னூர், திருச்சி',
        livingYears: '22 ஆண்டுகள்',
        property: 'சொந்த வீடு',
        bio: 'குர்ஆன் ஓதும் பழக்கம் மற்றும் குடும்ப பாங்கான பெண்.',
        requirement: 'நல்ல குணமுள்ள மணமகன் தேவை.',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
      {
        nikahId: 'TN-1005',
        fullName: 'அப்துல் காதர் ஜிலானி',
        fullNameEn: 'Abdul Khader Jailani',
        email: 'jilani@example.com',
        password: 'User@123',
        phone: '9171896625',
        gender: 'groom',
        age: 31,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.Tech IT',
        occupation: 'Technical Lead',
        workplace: 'துபாய் / சேலம்',
        monthlyIncome: '2,50,000/',
        incomeNum: 250000,
        height: '5.10 அடி',
        heightNum: 5.10,
        complexion: 'மாநிறம்',
        district: 'Salem',
        state: 'Tamil Nadu',
        isOverseas: true,
        citizenship: 'UAE Resident / Indian Citizen',
        countryOfResidence: 'UAE',
        property: 'சேலம் மற்றும் சென்னையில் சொத்துக்கள்',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'premium',
      },
      {
        nikahId: 'TN-1006',
        fullName: 'ஜைனப் மர்யம்',
        fullNameEn: 'Zainab Maryam',
        email: 'zainab@example.com',
        password: 'User@123',
        phone: '9171896626',
        gender: 'bride',
        age: 26,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.D.S (பல் மருத்துவர்)',
        occupation: 'Dental Surgeon',
        workplace: 'தனியார் மருத்துவமனை, நெல்லை',
        monthlyIncome: '60,000/',
        incomeNum: 60000,
        height: '5.4 அடி',
        heightNum: 5.4,
        complexion: 'மிகச் சிகப்பு',
        district: 'Tirunelveli',
        state: 'Tamil Nadu',
        nativePlace: 'திருநெல்வேலி',
        currentAddress: 'பாளையங்கோட்டை',
        property: 'சொந்த வீடு மற்றும் கிளினிக்',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
      {
        nikahId: 'TN-1007',
        fullName: 'நவாஸ் கனி',
        fullNameEn: 'Nawas Kani',
        email: 'nawas@example.com',
        password: 'User@123',
        phone: '9171896627',
        gender: 'groom',
        age: 28,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.Sc Marine Biology',
        occupation: 'கடல் உணவு ஏற்றுமதி வணிகம்',
        workplace: 'கீழக்கரை / ராமநாதபுரம்',
        monthlyIncome: '1,20,000/',
        incomeNum: 120000,
        height: '5.7 அடி',
        heightNum: 5.7,
        complexion: 'மாநிறம்',
        district: 'Ramanathapuram',
        state: 'Tamil Nadu',
        nativePlace: 'கீழக்கரை',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
      {
        nikahId: 'TN-1008',
        fullName: 'ரஹ்மத் நிஷா',
        fullNameEn: 'Rahmat Nisha',
        email: 'rahmat@example.com',
        password: 'User@123',
        phone: '9171896628',
        gender: 'bride',
        age: 25,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'M.Com, B.Ed',
        occupation: 'ஆசிரியர்',
        workplace: 'வேலூர்',
        monthlyIncome: '32,000/',
        incomeNum: 32000,
        height: '5.3 அடி',
        heightNum: 5.3,
        complexion: 'சிகப்பு',
        district: 'Vellore',
        state: 'Tamil Nadu',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
      {
        nikahId: 'TN-1009',
        fullName: 'சுல்தான் அலாவுதீன்',
        fullNameEn: 'Sultan Alaudeen',
        email: 'sultan@example.com',
        password: 'User@123',
        phone: '9171896629',
        gender: 'groom',
        age: 30,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.Pharm',
        occupation: 'மருந்தக உரிமையாளர் (Medical Store)',
        workplace: 'தஞ்சாவூர்',
        monthlyIncome: '80,000/',
        incomeNum: 80000,
        height: '5.8 அடி',
        heightNum: 5.8,
        complexion: 'மாநிறம்',
        district: 'Thanjavur',
        state: 'Tamil Nadu',
        isVerified: true,
        verificationStatus: 'verified',
        subscriptionStatus: 'free_trial',
      },
    ];

    for (const u of verifiedUsersData) {
      const user = new User(u);
      await user.save();
    }
    console.log(`✓ Seeded ${verifiedUsersData.length} verified profiles.`);

    // 3. Seed PENDING Verification Profiles (Strictly unverified for Admin Queue testing)
    const pendingUsersData = [
      {
        nikahId: 'TN-1010',
        fullName: 'முகமது ரியாஸ்',
        fullNameEn: 'Mohamed Riaz',
        email: 'riaz.pending@example.com',
        password: 'User@123',
        phone: '9840123456',
        gender: 'groom',
        age: 26,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.Com, MBA',
        occupation: 'Financial Analyst',
        workplace: 'T.Nagar, Chennai',
        monthlyIncome: '55,000/',
        district: 'Chennai',
        state: 'Tamil Nadu',
        isVerified: false, // Strict Gating: Unverified
        verificationStatus: 'pending',
        kycDocument: {
          docType: 'Aadhaar',
          filename: 'kyc-sample-aadhaar.txt',
          originalName: 'Aadhaar_MohamedRiaz.pdf',
          mimeType: 'text/plain',
          size: 154000,
          uploadedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
        },
      },
      {
        nikahId: 'TN-1011',
        fullName: 'பாத்திமா ஸஹ்ரா',
        fullNameEn: 'Fathima Zehra',
        email: 'zehra.pending@example.com',
        password: 'User@123',
        phone: '9840987654',
        gender: 'bride',
        age: 23,
        maritalStatus: 'திருமணம் ஆகாதவர்',
        education: 'B.E Electronics',
        occupation: 'Graduate Trainee',
        workplace: 'திருச்சி',
        monthlyIncome: '30,000/',
        district: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        isVerified: false, // Strict Gating: Unverified
        verificationStatus: 'pending',
        kycDocument: {
          docType: 'Passport',
          filename: 'kyc-sample-passport.txt',
          originalName: 'Passport_FathimaZehra.pdf',
          mimeType: 'text/plain',
          size: 320000,
          uploadedAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
        },
      },
      {
        nikahId: 'TN-1012',
        fullName: 'கமால் பாஷா',
        fullNameEn: 'Kamal Basha',
        email: 'kamal.pending@example.com',
        password: 'User@123',
        phone: '9840112233',
        gender: 'groom',
        age: 32,
        maritalStatus: 'மறுமணம்',
        education: 'Diploma in Civil',
        occupation: 'கட்டிட ஒப்பந்ததாரர் (Contractor)',
        workplace: 'திண்டுக்கல்',
        monthlyIncome: '70,000/',
        district: 'Dindigul',
        state: 'Tamil Nadu',
        isVerified: false,
        verificationStatus: 'pending',
        kycDocument: {
          docType: 'PAN',
          filename: 'kyc-sample-pan.txt',
          originalName: 'PAN_KamalBasha.jpg',
          mimeType: 'text/plain',
          size: 89000,
          uploadedAt: new Date(Date.now() - 3600000 * 12),
        },
      },
    ];

    for (const p of pendingUsersData) {
      const user = new User(p);
      await user.save();
    }
    console.log(`✓ Seeded ${pendingUsersData.length} pending KYC profiles for admin verification.`);

    // 4. Seed Support Tickets
    const tickets = [
      {
        name: 'அப்துல்லாஹ்',
        email: 'abdullah@example.com',
        phone: '9841000001',
        subject: 'KYC Document verification status check',
        message: 'Assalamu Alaikum. I uploaded my Aadhaar document 2 days ago. Please verify my profile so I can connect with bride families.',
        status: 'open',
      },
      {
        name: 'மரியம் பாத்திமா',
        email: 'mariam@example.com',
        phone: '9841000002',
        subject: 'Annual Membership Plan details',
        message: 'Could you explain what is included in the ₹999 Premium annual plan?',
        status: 'resolved',
        adminResponse: 'Assalamu Alaikum sister. The annual premium includes unlimited profile views, direct family contact numbers, and priority support for 365 days.',
        resolvedAt: new Date(),
      },
    ];

    for (const t of tickets) {
      const ticket = new SupportTicket(t);
      await ticket.save();
    }
    console.log(`✓ Seeded ${tickets.length} customer support tickets.`);

    console.log('\n[Seed Completed Successfully] All test users, admin, and tickets are ready!\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
