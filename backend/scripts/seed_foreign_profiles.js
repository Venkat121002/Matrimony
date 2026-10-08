import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/mongo/User.js';

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tamil_nikah');
  console.log('Connected to MongoDB');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const foreignProfiles = [
    {
      nikahId: 'TN-FOR-101',
      fullName: 'முகம்மது அசாருதீன்',
      fullNameEn: 'Mohamed Azarudeen',
      email: 'azar.singapore@tamilnikah.com',
      password: hashedPassword,
      phone: '+65 9123 4567',
      gender: 'groom',
      age: 29,
      maritalStatus: 'திருமணம் ஆகாதவர்',
      education: 'B.Eng (Computer Engineering) - NUS',
      educationEn: 'B.Eng Computer Engineering - NUS Singapore',
      occupation: 'Senior Cloud Solutions Architect',
      workplace: 'Google Singapore, Marina Bay',
      workplaceEn: 'Google Singapore, Marina Bay',
      workingYearsInTitleLocation: '4',
      monthlyIncome: 'SGD 9,500 (~ ₹5,80,000)',
      incomeNum: 580000,
      height: '5.10 அடி',
      heightNum: 5.10,
      complexion: 'சிகப்பு',
      language: 'தமிழ்-முஸ்லிம்',
      state: 'Overseas',
      district: 'Overseas - Singapore',
      nativePlace: 'திருச்சி (Tiruchirappalli) / Singapore',
      currentAddress: 'Tanjong Pagar, Singapore',
      property: 'சொந்த வீடு & காண்டோ (Own Condo Singapore & House in Trichy)',
      bio: 'சிங்கப்பூரில் சாப்ட்வேர் துறையில் பணிபுரியும் தமிழ் முஸ்லிம் குடும்பம். நல்ல நற்குணம் கொண்ட மணமகள் எதிர்பார்ப்பு.',
      isOverseas: true,
      citizenship: 'Singapore',
      countryOfResidence: 'Singapore',
      familyDetails: {
        fatherName: 'ஜனாப் அப்துல் கரீம்',
        fatherAge: 58,
        fatherOccupation: 'Business Executive (Singapore)',
        motherName: 'ஆயிஷா பேகம்',
        motherAge: 53,
        motherOccupation: 'இல்லத்தரசி (Home Maker)',
        siblings: [
          { name: 'சுமையா பரக்கத்', relation: 'sister', maritalStatus: 'married' },
          { name: 'அகமது நவாஸ்', relation: 'brother', maritalStatus: 'unmarried' }
        ]
      },
      workPreferences: {
        groomWorkPreference: 'மணமகள் பணிபுரிய வேண்டும் (I need a bride who will work)',
        brideWorkStatus: '',
        notes: 'சிங்கப்பூரில் இருவருமாக பணிபுரிந்து நல்வாழ்க்கை அமைக்க விரும்புகிறேன்.'
      },
      workPreference: 'மணமகள் பணிபுரிய வேண்டும் (I need a bride who will work)',
      isVerified: true,
      verificationStatus: 'verified',
      role: 'user',
      photos: []
    },
    {
      nikahId: 'TN-FOR-102',
      fullName: 'பாத்திமா ஷப்னா',
      fullNameEn: 'Fathima Shabna',
      email: 'shabna.dubai@tamilnikah.com',
      password: hashedPassword,
      phone: '+971 50 123 4567',
      gender: 'bride',
      age: 25,
      maritalStatus: 'திருமணம் ஆகாதவர்',
      education: 'M.Sc Data Analytics - Dubai',
      educationEn: 'M.Sc Data Analytics - Dubai',
      occupation: 'Financial Data Analyst',
      workplace: 'Emirates NBD, Dubai Media City',
      workplaceEn: 'Emirates NBD, Dubai Media City',
      workingYearsInTitleLocation: '3',
      monthlyIncome: 'AED 14,000 (~ ₹3,15,000)',
      incomeNum: 315000,
      height: '5.4 அடி',
      heightNum: 5.4,
      complexion: 'மிகச் சிகப்பு',
      language: 'தமிழ்-முஸ்லிம்',
      state: 'Overseas',
      district: 'Overseas - UAE',
      nativePlace: 'காயல்பட்டினம் (Kayalpatnam) / UAE',
      currentAddress: 'Downtown Dubai, UAE',
      property: 'சொந்த வீடு (Own House)',
      bio: 'துபாயில் பணியாற்றும் பண்பான மணமகள். தொழுகை மற்றும் மார்க்கப்பற்றுள்ள மணமகன் எதிர்பார்ப்பு.',
      isOverseas: true,
      citizenship: 'United Arab Emirates',
      countryOfResidence: 'United Arab Emirates',
      familyDetails: {
        fatherName: 'ஹாஜி முஹம்மது இக்பால்',
        fatherAge: 56,
        fatherOccupation: 'Wholesale Textile Trader (Dubai)',
        motherName: 'நூர்ஜஹான்',
        motherAge: 51,
        motherOccupation: 'இல்லத்தரசி (Home Maker)',
        siblings: [
          { name: 'தாரிஃக் அன்வர்', relation: 'brother', maritalStatus: 'married' },
          { name: 'சாரா மர்யம்', relation: 'sister', maritalStatus: 'unmarried' }
        ]
      },
      workPreferences: {
        groomWorkPreference: '',
        brideWorkStatus: 'நான் பணிபுரிவேன் (I will work)',
        notes: 'துபாயில் அல்லது வெளிநாட்டில் பணிபுரியும் நல்ல வரன் எதிர்பார்ப்பு.'
      },
      workPreference: 'நான் பணிபுரிவேன் (I will work)',
      isVerified: true,
      verificationStatus: 'verified',
      role: 'user',
      photos: []
    },
    {
      nikahId: 'TN-FOR-103',
      fullName: 'ரியாஸ் அஹமது',
      fullNameEn: 'Riyaz Ahmed',
      email: 'riyaz.kl@tamilnikah.com',
      password: hashedPassword,
      phone: '+60 12 345 6789',
      gender: 'groom',
      age: 31,
      maritalStatus: 'திருமணம் ஆகாதவர்',
      education: 'B.E & MBA - University of Malaya',
      educationEn: 'B.E & MBA - University of Malaya',
      occupation: 'Operations Director',
      workplace: 'Petronas Technology Partner, KL',
      workplaceEn: 'Petronas Technology Partner, KL',
      workingYearsInTitleLocation: '5',
      monthlyIncome: 'MYR 18,000 (~ ₹3,40,000)',
      incomeNum: 340000,
      height: '5.9 அடி',
      heightNum: 5.9,
      complexion: 'மாநிறம்',
      language: 'தமிழ்-முஸ்லிம்',
      state: 'Overseas',
      district: 'Overseas - Malaysia',
      nativePlace: 'சென்னை (Chennai) / Malaysia',
      currentAddress: 'Mont Kiara, Kuala Lumpur',
      property: 'சொந்த வில்லா & நிலம் (Own Villa)',
      bio: 'மலேசியாவில் சொந்த நிறுவனம் மற்றும் பணி. அமைதியான, நல்ல குடும்ப வரன் எதிர்பார்ப்பு.',
      isOverseas: true,
      citizenship: 'Malaysia',
      countryOfResidence: 'Malaysia',
      familyDetails: {
        fatherName: 'சையத் இப்ராஹிம்',
        fatherAge: 62,
        fatherOccupation: 'Retired Govt Official',
        motherName: 'ஜமீலா பீவி',
        motherAge: 57,
        motherOccupation: 'இல்லத்தரசி (Home Maker)',
        siblings: [
          { name: 'இம்ரான் கான்', relation: 'brother', maritalStatus: 'married' }
        ]
      },
      workPreferences: {
        groomWorkPreference: 'நான் அனுமதித்தால் பணிபுரியலாம் (I need a bride who will work if I allow)',
        brideWorkStatus: '',
        notes: 'மலேசிய குடியுரிமை பெற்ற குடும்பம்.'
      },
      workPreference: 'நான் அனுமதித்தால் பணிபுரியலாம் (I need a bride who will work if I allow)',
      isVerified: true,
      verificationStatus: 'verified',
      role: 'user',
      photos: []
    }
  ];

  for (const p of foreignProfiles) {
    await User.findOneAndUpdate(
      { nikahId: p.nikahId },
      { $set: p },
      { upsert: true, new: true }
    );
    console.log('Upserted:', p.nikahId, p.fullNameEn, p.citizenship);
  }

  const overseasTotal = await User.countDocuments({ isOverseas: true });
  console.log('Total Overseas Profiles in DB:', overseasTotal);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
