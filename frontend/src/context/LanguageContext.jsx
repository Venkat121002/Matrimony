import React, { createContext, useContext, useState, useEffect } from 'react';
import { transliterateName } from '../utils/tamilTransliterate';

const LanguageContext = createContext();

export const translations = {
  ta: {
    // Header
    siteTitle: 'Tamil Muslim Nikkah',
    tagline: 'இஸ்லாமிய சகோதர, சகோதரிகளுக்கான மிகச்சிறந்த திருமண தகவல் தளம்',
    regHelp: 'பதிவு உதவி & தகவல்',
    workHours: 'வேலை நேரம் : 9.00 am - 9.00 pm',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',

    // Gender Radio Bar & Section
    genderLabel: 'பிரிவு / பாலினம் :',
    allGenders: 'அனைத்து வரன்கள்',
    allGendersOption: 'அனைத்து வரன்கள்',
    groom: 'மணமகன்',
    bride: 'மணமகள்',
    overseasTab: '🌍 அயல்நாட்டு வாழ் தமிழர்கள் (Overseas Tamils)',
    overseasBadge: 'வெளிநாட்டு குடியுரிமை',

    // Banner
    bannerText: 'அன்பார்ந்த! இஸ்லாமிய சகோதர, சகோதரிகளே! மணமகன் மற்றும் மணமகள் விவரங்களை புதிதாக இலவசமாக இங்கே பதிவு செய்யவும்.',
    bannerBtn: 'இங்கே பதிவு செய்',
    bannerOverseasBtn: '🌍 அயல்நாட்டு வரன் பதிவு (Overseas Tamil Registration)',

    // Login Box
    loginTitle: 'உள்நுழைவு',
    username: 'Username',
    phonePlaceholder: 'தொலைபேசி எண்',
    password: 'Password',
    passwordLabel: 'கடவுச்சொல்',
    loginBtn: 'உள்நுழைக',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    howToLogin: 'உள்நுழைவது எப்படி? ',
    videoGuide: 'வீடியோ',
    noLoginId: 'கணக்கு இல்லையா?',
    registerHere: 'இங்கே பதிவு செய்யவும்',
    registerFree: 'இலவச பதிவு',
    helpDesk: 'உதவி மையம்',

    // Menu Dropdown
    menu: 'Menu',
    mainMenu: 'முதன்மை மெனு (Navigation)',
    home: 'முகப்பு',
    register: 'பதிவு',
    overseasMenu: '🌍 அயல்நாட்டு வாழ் தமிழர்கள்',
    aboutUs: 'எங்களைப் பற்றி',
    contact: 'தொடர்புக்கு',

    // Filter Box
    filterBoxTitle: 'வரன் தேடல் & வடிகட்டி (MATRIMONIAL SEARCH)',
    collapse: 'சுருக்குக',
    expand: 'விரிவாக்குக',
    searchIdLabel: 'Search ID (வரன் எண்):',
    searchIdPlaceholder: 'எ.கா: 100001',
    maritalStatusLabel: 'திருமணம் :',
    languageLabel: 'மொழி :',
    ageRangeLabel: 'வயது வரம்பு :',
    from: 'முதல்',
    to: 'to',
    educationLabel: 'படிப்பு :',
    locationLabel: 'வட்டாரம் :',
    radiusLabel: 'வட்ட தூரம் :',
    searchBtn: 'Search (தேடுக)',
    resetBtn: 'மீட்டமை',
    allOptions: 'அனைத்தும்',
    allCities: 'அனைத்து ஊர்களும்',
    selectRadius: 'தேர்வு செய்க',
    allDistances: 'அனைத்து தூரமும்',

    // New Filter Box Fields
    citizenshipFilterLabel: 'குடியுரிமை நாடு (Citizenship) :',
    residenceFilterLabel: 'வசிக்கும் நாடு (Residence) :',
    employmentFilterLabel: 'பணி நிலை (Employment) :',
    willingnessFilterLabel: 'வேலை விருப்பம் (Work Status/Pref) :',
    nativePlaceFilterLabel: 'சொந்த ஊர் (Native Place) :',
    nativePlacePlaceholder: 'எ.கா: ராமநாதபுரம் / மதுரை',
    minSalaryLabel: 'குறைந்தபட்ச மாத வருமானம் :',
    minHeightLabel: 'குறைந்தபட்ச உயரம் :',
    partnerPrefKeywordLabel: 'எதிர்பார்ப்புகளில் தேட (Preferences) :',
    partnerPrefKeywordPlaceholder: 'எ.கா: குடும்பப் பாங்கு / நற்குணம்',
    allCitizenships: 'அனைத்து குடியுரிமைகளும்',
    allResidences: 'அனைத்து நாடுகளும்',
    allEmploymentStatus: 'அனைத்து பணி நிலைகளும்',
    allWorkStatus: 'அனைத்து வேலை விருப்பங்களும்',
    allSalaries: 'அனைத்து வருமானங்களும்',
    allHeights: 'அனைத்து உயரங்களும்',

    // Warning Boxes
    warningTitle: 'எச்சரிக்கை!',
    dowryWarning: 'வரதட்சனை வாங்குவதும் கொடுப்பதும் இஸ்லாத்திற்கு முரணானது. மேலும், இந்திய சட்டத்தின்படி தண்டனைக்குரிய குற்றமாகும்.',
    delayTitle: 'தாமதிக்காதீர்!',
    delayWarning: 'பருவமடைந்த பெண்ணின் திருமணத்தை தாமதிப்பது இஸ்லாத்திற்கு எதிரானது! மேலும், இது சமுதாய சீர்கேட்டிற்கு வழிவகுக்கும்!',

    // App Download
    appDownloadTitle: 'ஆண்ட்ராய்டு ஆப்ஸ் பதிவிறக்கம்',
    appDownloadSub: 'Android App Download',

    // Profile Card
    groomDetails: 'மணமகன் விவரங்கள்',
    brideDetails: 'மணமகள் விவரங்கள்',
    shortlist: 'தேர்வு செய்',
    reject: 'நிராகரி',
    photoCursor: 'புகைப்படம் காண கிளிக் செய்க',
    photoLogin: 'புகைப்படம் பார்க்க உள்நுழைக',
    clickHere: 'இங்கே கிளிக் செய்க',
    contactCol: 'தொடர்புக்கு :',
    phoneCol: 'தொலைபேசி',
    rejectedNotice: '(நிராகரிக்கப்பட்டது)',
    showAgain: 'மீண்டும் காட்டு',
    suitableBrideReq: 'தகுந்த பெண் தேவை.',
    suitableGroomReq: 'தகுந்த ஆண் தேவை.',
    viewFullProfile: 'முழு விவரங்கள் காண ➜',
    closeProfile: 'மூடுக',

    // Card Row Labels
    labelName: 'பெயர்',
    labelAge: 'வயது',
    labelEducation: 'படிப்பு',
    labelMarital: 'திருமணம்',
    labelLocation: 'வசிப்பிடம்',
    labelLanguage: 'மொழி',
    labelProfession: 'வேலை',
    labelIncome: 'வருமானம்',
    labelHeight: 'உயரம்',
    labelProperty: 'சொத்து',
    labelNative: 'சொந்த ஊர்',
    labelWorkplace: 'பணியிடம்',
    labelCitizenship: 'குடியுரிமை',
    labelResidence: 'வசிக்கும் நாடு',
    labelWorkStatus: 'வேலை விருப்பம்',

    // Section Titles in Details Modal
    personalDetailsTitle: '1. சுய விவரங்கள் (Personal Details)',
    fatherDetailsTitle: "2. தந்தை விவரங்கள் (Father's Details)",
    motherDetailsTitle: "3. தாய் விவரங்கள் (Mother's Details)",
    workPrefTitle: '4. பணி மற்றும் வேலை விருப்பம் (Employment Preference)',
    overseasDetailsTitle: '5. அயல்நாட்டு & குடியுரிமை விவரங்கள் (Overseas & Citizenship)',
    otherDetailsTitle: '6. இதர விவரங்கள் (Other Details)',

    // Detailed Personal Field Labels
    workplaceLabel: 'தற்போதைய பணியிடம் / தொழில்',
    nativePlaceLabel: 'சொந்த ஊர் (Native Place)',
    currentAddressLabel: 'தற்போதைய முகவரி (Current Address)',
    livingYearsLabel: 'இங்கு வசிக்கும் ஆண்டுகள் (Years Living)',
    complexionLabel: 'நிறம் / உடல் தோற்றம் (Complexion)',
    birthOrderLabel: 'பிறந்த வரிசை (Birth Order)',
    siblingsCountLabel: 'உடன்பிறப்புகள் எண்ணிக்கை (Siblings Count)',
    siblingDetailsLabel: 'உடன்பிறப்புகள் விவரம் (Sibling Details)',
    elderSisterLabel: 'மூத்த சகோதரி (அக்கா)',
    youngerSisterLabel: 'இளைய சகோதரி (தங்கை)',
    elderBrotherLabel: 'மூத்த சகோதரர் (அண்ணன்)',
    youngerBrotherLabel: 'இளைய சகோதரர் (தம்பி)',

    // Detailed Parents Labels
    fatherNameLabel: 'தந்தையின் பெயர்',
    fatherAgeLabel: 'தந்தையின் வயது',
    fatherJobLabel: 'தந்தையின் தொழில் / பணி',
    motherNameLabel: 'தாயின் பெயர்',
    motherAgeLabel: 'தாயின் வயது',

    // Bride & Groom Work Preferences
    brideWorkPrefLabel: 'மணமகளின் பணி விருப்பம் (Bride Employment Preference)',
    groomWorkPrefLabel: 'மணமகனின் விருப்பம் (Groom Preference for Bride)',
    willWork: 'வேலைக்கு செல்வார் (Will Work)',
    willNotWork: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி (Will Not Work / Homemaker)',
    workIfPermitted: 'அனுமதி தந்தால் வேலைக்கு செல்வார் (Will Work if Permission is Given)',
    lookingForWorking: 'வேலை பார்க்கும் மணமகள் தேவை (Looking for a Working Bride)',
    lookingForHomemaker: 'இல்லத்தரசி மணமகள் தேவை (Looking for a Homemaker)',
    noPreference: 'விருப்பம் / நிபந்தனை இல்லை (No Preference)',

    // Other Details
    propertyDetailsLabel: 'சொத்து விவரங்கள் (Property Details)',
    expectationsLabel: 'எதிர்பார்ப்புகள் / வரன் விருப்பங்கள் (Partner Preferences)',

    // Overseas Section & Banner
    overseasSectionTitle: 'அயல்நாட்டு வாழ் தமிழர்கள் & வெளிநாட்டு குடியுரிமை வரன்கள்',
    overseasSubtitle: 'UK, USA, UAE, Canada, Australia மற்றும் பிற நாடுகளில் குடியுரிமை பெற்று வாழும் தமிழ் முஸ்லிம் வரன்கள்',
    overseasOnlyNotice: 'தேர்ந்தெடுக்கப்பட்ட வெளிநாட்டில் குடியுரிமை (Citizenship) வைத்துள்ள வரன்கள் மட்டுமே இப்பிரிவில் இடம்பெற்றுள்ளனர்.',
    overseasFilterAll: 'அனைத்து வெளிநாட்டு வரன்கள்',

    // Modal Registration
    modalRegTitle: 'புதிய திருமண பதிவு (Free Registration)',
    modalRegTypeDomestic: 'உள்நாட்டு பதிவு (Domestic)',
    modalRegTypeOverseas: '🌍 அயல்நாட்டு வாழ் தமிழர் பதிவு (Overseas Tamil Citizen)',
    modalRegOverseasNotice: 'கவனத்திற்கு: UK, USA, UAE, Canada, Australia அல்லது பிற வெளிநாட்டு குடியுரிமை (Foreign Citizenship) பெற்றுள்ளவர்கள் மட்டுமே இப்பிரிவில் பதிவு செய்ய இயலும்.',
    modalRegCitizenshipConfirm: 'நான் தேர்ந்தெடுக்கப்பட்ட நாட்டில் சட்டப்பூர்வ வெளிநாட்டு குடியுரிமை (Citizenship) பெற்றுள்ளேன் என்பதை உறுதி செய்கிறேன்.',
    modalRegBanner: 'மணமகன் மற்றும் மணமகள் விவரங்களை இலவசமாக இங்கே பதிவு செய்யவும்.',
    modalRegGenderGroom: 'மணமகன் (Groom)',
    modalRegGenderBride: 'மணமகள் (Bride)',
    modalRegName: 'பெயர் (Name) *',
    modalRegAge: 'வயது (Age) *',
    modalRegEdu: 'படிப்பு (Education)',
    modalRegMarital: 'திருமணம் (Marital Status)',
    modalRegLoc: 'வசிப்பிடம் / ஊர் (Location) *',
    modalRegLang: 'மொழி (Language)',
    modalRegJob: 'வேலை / தொழில் (Profession)',
    modalRegIncome: 'வருமானம் (Monthly Salary / Income)',
    modalRegHeight: 'உயரம் (Height)',
    modalRegProperty: 'சொத்து (Property)',
    modalRegPhone: 'தொலைபேசி எண் (Phone Number) *',
    modalRegSubmit: 'முழு விவரங்களையும் பதிவு செய்க',

    // App Results
    totalProfiles: 'மொத்த வரன்கள்:',
    shortlistedProfiles: 'தேர்வு செய்யப்பட்டவை:',
    selectedShortlistDrawer: 'நீங்கள் தேர்வு செய்த வரன்கள்',
    loadMore: 'மேலும் வரன்களைக் காண (Load More)',
    noProfilesFound: 'நீங்கள் தேடிய அளவுகோல்களுக்கு வரன்கள் ஏதும் கிடைக்கவில்லை.',
    adjustFilters: 'வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.',
    showAllBtn: 'அனைத்து வரன்களையும் காட்டு',

    // Modals
    modalAboutTitle: 'எங்களைப் பற்றி (About Us)',
    modalAboutText1: 'இஸ்லாமிய ஷரீஅத் முறைப்படி மணமகன் மற்றும் மணமகள் விவரங்களை நம்பகத்தன்மையுடன் ஒருங்கிணைத்து, ஏழை, எளிய, நடுத்தர குடும்பங்கள் மற்றும் அயல்நாட்டு வாழ் தமிழ் முஸ்லிம் சகோதர சகோதரிகளுக்கும் மிகச் சிறந்த திருமண வரன்களை அமைத்துக் கொடுப்பதே எங்களின் தலையாய நோக்கமாகும்.',
    modalOurPolicy: 'எங்களின் கொள்கை:',
    modalPolicy1: 'வரதட்சணை வாங்குவதையும் கொடுப்பதையும் முற்றிலும் தவிர்ப்போம்.',
    modalPolicy2: 'நேர்மையான மற்றும் சரிபார்க்கப்பட்ட வரன் விவரங்கள்.',
    modalPolicy3: 'நம்பகமான வாடிக்கையாளர் சேவை.',
    modalClose: 'சரி (Close)',

    modalContactTitle: 'தொடர்புக்கு (Contact Us)',
    modalPhoneLabel: 'தொலைபேசி எண்',
    modalWhatsAppLabel: 'வாட்ஸ்அப் (WhatsApp)',
    modalWhatsAppDirect: '+91 91718 96625 (நேரடி அரட்டை)',
    modalWorkHoursLabel: 'வேலை நேரம்',
    modalWorkHoursVal: 'காலை 9.00 am முதல் இரவு 9.00 pm வரை',

    modalLoginDesc: 'முழு விவரங்கள் மற்றும் தொலைபேசி எண்ணை பார்க்க தயவுசெய்து Login செய்யவும்.',

    modalVideoTitle: 'Login செய்வது எப்படி? (வீடியோ வழிகாட்டி)',
    modalVideoStep1: '1. உங்கள் மொபைல் எண்ணை உள்ளிடவும்',
    modalVideoStep2: '2. கடவுச்சொல்லை உள்ளிட்டு Login பொத்தானை அழுத்தவும்',
    modalVideoStep3: '3. மணமகன்/மணமகள் விவரங்களை முழுமையாக காணவும்',

    // Footer
    footerAbout: 'இஸ்லாமிய ஷரீஅத் நெறிமுறைகளுக்கு உட்பட்டு, நம்பகமான மற்றும் வரதட்சணையற்ற நிக்காஹ் திருமண வரன்களை இணைக்கும் தமிழ்நாடு மற்றும் உலகளாவிய முஸ்லிம் குடும்பங்களுக்கான தலைசிறந்த திருமண தகவல் தளம்.',
    footerVerified: '100% நம்பகமான & சரிபார்க்கப்பட்ட வரன்கள்',
    footerServicesTitle: 'எங்களின் சேவைகள் (Services)',
    footerService1: 'மணமகன் & மணமகள் புதிய வரன் இலவச பதிவு',
    footerService2: 'பெண்களுக்கான முழுமையான போட்டோ ரகசிய காப்பு',
    footerService3: 'மறுமணம், விவாகரத்து ஆனவர்களுக்கான பிரத்யேக வரன்கள்',
    footerService4: 'அயல்நாட்டு வாழ் தமிழ் முஸ்லிம்களுக்கான பிரத்யேக பகுதி',
    footerService5: 'வரதட்சணை இல்லா சுன்னத்தான திருமண வழிகாட்டல்',
    footerTimingsTitle: 'தொடர்பு & வேலை நேரம்',
    footerAllDays: '(அனைத்து நாட்களும்)',
    footerHelpDesk: 'உதவி தொலைபேசி எண்:',
    footerGuidelinesTitle: 'இஸ்லாமிய வழிகாட்டல்',
    footerFreeRegBtn: 'இலவச பதிவு',
    footerTerms: 'விதிமுறைகள்',
    footerLogin: 'உள்நுழைவு',

    // Admin & Super Admin Portal
    superAdminPortalTitle: 'தமிழ் முஸ்லிம் நிக்காஹ் - SUPER ADMIN',
    adminPortalTitle: 'தமிழ் முஸ்லிம் நிக்காஹ் - ADMIN',
    adminAccessOnlyDesc: 'நிர்வாகி உள்நுழைவு தளம் (Administrative Access Only)',
    superAdminPromptText: '🔒 Super Admin நற்சான்றுகளை உள்ளிட்டு தொடரவும்',
    adminPromptText: '🔒 Admin நற்சான்றுகளை உள்ளிட்டு தொடரவும்',
    adminUsernameLabel: 'நிர்வாகி பெயர் (Username)',
    adminPasswordLabel: 'கடவுச்சொல் (Password)',
    adminChecking: 'சரிபார்க்கிறது...',
    superAdminLoginBtn: 'உள்நுழைக (Super Admin Login)',
    adminLoginBtn: 'உள்நுழைக (Admin Login)',
    returnToWebBtn: '← தளத்திற்கு திரும்புக (Return to Website)',
    adminPortalSubTitle: 'பதிவு செய்யப்பட்ட வரன்கள் & நிர்வாக சரிபார்ப்பு தளம் (Registered Users & Verification)',
    superAdminPortalSubTitle: 'பதிவு செய்யப்பட்ட வரன்கள் பார்வை தளம் (Registered Users View Portal)',
    adminRefreshBtn: 'புதுப்பிக்க (Refresh)',
    adminUserSideBtn: 'User Side செல்ல',
    adminLogoutBtn: 'வெளியேறு (Logout)',
    adminRegistryBanner: 'பதிவு செய்யப்பட்ட பயனர்கள் பட்டியல் (Registered Users Registry)',
    adminTotalCandidates: 'மொத்த வரன்கள்',
    adminPendingCount: 'சரிபார்க்கப்பட வேண்டியவை',
    adminSearchPlaceholder: 'பெயர் / Nikah ID / போன் மூலம் தேடுக...',
    adminTabAll: 'அனைத்து வரன்கள் (All)',
    adminTabPending: 'சரிபார்க்க வேண்டியவை (Pending)',
    adminTabVerified: 'தளத்தில் உள்ளவை (Verified)',
    adminVerificationNotice: 'நிர்வாக சரிபார்ப்பு விதி: புதிதாகப் பதிவு செய்யும் வரன்கள் நிர்வாகி நீங்கள் "சரிபார்க்கவும் (Verify)" பட்டனை கிளிக் செய்த பின்னரே பொதுப் பயனர்களுக்கு இணையதளத்தில் காட்டப்படும்.',
    superAdminViewNotice: 'Super Admin பார்வை தளம்: இங்கு அனைத்து வரன்களின் முழுமையான விவரங்களையும் பார்வையிடலாம். வரன்களை சரிபார்க்க மற்றும் நீக்க Admin பக்கத்திற்கு (/admin) செல்லவும்.',
    adminTableTitle: 'பதிவு செய்யப்பட்ட பயனர்கள்',
    superAdminViewOnlyBadge: 'Super Admin பார்வை தளம் (View Only)',
    adminManageBadge: 'Admin சரிபார்ப்பு தளம்',
    adminColNikahId: 'Nikah ID',
    adminColName: 'வரன் பெயர் (Candidate Name)',
    adminColGenderAge: 'வகை & வயது',
    adminColPhone: 'மொபைல் எண்',
    adminColDistrict: 'மாவட்டம்',
    adminColStatus: 'சரிபார்ப்பு நிலை',
    adminColActions: 'செயல்கள் (Actions)',
    adminColViewOnly: 'விவரங்கள் (Details)',
    adminBtnDetails: 'விவரங்கள்',
    adminBtnVerify: 'சரிபார் (Verify)',
    adminBtnDelete: 'நீக்குக',
    adminBtnRevoke: 'திரும்பப்பெற (Revoke)',
    adminStatusPending: 'சரிபார்க்கப்பட வேண்டும்',
    adminStatusVerified: 'சரிபார்க்கப்பட்டது (Live)',
    adminStatusRejected: 'நிராகரிக்கப்பட்டது',
    adminSuperAdminViewOnlyTag: '👁 பார்வை தளம் (View Only)',
    adminDeleteModalTitle: 'வரனை நிரந்தரமாக நீக்கவா?',
    adminDeleteModalDesc: 'என்பவரின் கணக்கை நீக்க விரும்புகிறீர்களா?',
    adminDeleteModalWarn: '⚠ இந்த செயல்முறை மீளமைக்க முடியாது. பயனரின் அனைத்து தரவுகள் மற்றும் புகைப்படங்கள் தளத்திலிருந்து நீக்கப்படும்.',
    adminDeleteCancel: 'ரத்து செய்க (Cancel)',
    adminDeleteConfirm: 'ஆம், நீக்குக (Delete User)',
    adminCloseModal: 'மூடுக (Close)',
  },

  en: {
    // Header
    siteTitle: 'Tamil Muslim Nikkah',
    tagline: 'The Premier Matrimonial Portal for Islamic Brothers & Sisters',
    regHelp: 'Registration Help & Info',
    workHours: 'Working Hours : 9.00 am - 9.00 pm',
    selectLanguage: 'Select Language',

    // Gender Radio Bar & Section
    genderLabel: 'Section / Gender :',
    allGenders: 'All Profiles',
    allGendersOption: 'All Profiles',
    groom: 'Groom',
    bride: 'Bride',
    overseasTab: '🌍 Overseas Tamils (Foreign Citizens)',
    overseasBadge: 'Foreign Citizen',

    // Banner
    bannerText: 'Respected Islamic Brothers & Sisters! Register new bride and groom profile details here completely free.',
    bannerBtn: 'Register Here Free',
    bannerOverseasBtn: '🌍 Overseas Tamil Citizen Registration',

    // Login Box
    loginTitle: 'LOG IN',
    username: 'Username',

    password: 'Password',
    passwordLabel: 'Password',
    loginBtn: 'Login',
    forgotPassword: 'Forgot Password?',
    howToLogin: 'How to Login? ',
    videoGuide: 'Video Guide',
    noLoginId: "Don't have a Login ID?",
    registerHere: 'Register Here',
    registerFree: 'Register Free',
    helpDesk: 'Help Desk',

    // Menu Dropdown
    menu: 'Menu',
    mainMenu: 'Main Navigation Menu',
    home: 'Home',
    register: 'Register',
    overseasMenu: '🌍 Overseas Tamils',
    aboutUs: 'About Us',
    contact: 'Contact Us',

    // Filter Box
    filterBoxTitle: 'MATRIMONIAL SEARCH & FILTERS',
    collapse: 'Collapse',
    expand: 'Expand',
    searchIdLabel: 'Search ID (Profile No):',
    searchIdPlaceholder: 'e.g.: 100001',
    maritalStatusLabel: 'Marital Status :',
    languageLabel: 'Mother Tongue :',
    ageRangeLabel: 'Age Range :',
    from: 'from',
    to: 'to',
    educationLabel: 'Education :',
    locationLabel: 'City / District :',
    radiusLabel: 'Search Radius :',
    searchBtn: 'Search Profiles',
    resetBtn: 'Reset Filters',
    allOptions: 'All',
    allCities: 'All Cities / Districts',
    selectRadius: 'Select Radius',
    allDistances: 'All Distances',

    // New Filter Box Fields
    citizenshipFilterLabel: 'Country of Citizenship :',
    residenceFilterLabel: 'Country of Residence :',
    employmentFilterLabel: 'Employment Status :',
    willingnessFilterLabel: 'Willingness to Work / Preference :',
    nativePlaceFilterLabel: 'Native Place :',
    nativePlacePlaceholder: 'e.g.: Ramanathapuram / Madurai',
    minSalaryLabel: 'Minimum Monthly Salary :',
    minHeightLabel: 'Minimum Height :',
    partnerPrefKeywordLabel: 'Search in Partner Preferences :',
    partnerPrefKeywordPlaceholder: 'e.g.: religious, family-oriented',
    allCitizenships: 'All Citizenships',
    allResidences: 'All Countries of Residence',
    allEmploymentStatus: 'All Employment Statuses',
    allWorkStatus: 'All Work Preferences',
    allSalaries: 'All Salary Levels',
    allHeights: 'All Heights',

    // Warning Boxes
    warningTitle: 'WARNING!',
    dowryWarning: 'Taking or demanding dowry is strictly against Islam. Furthermore, it is a punishable criminal offence under Indian law.',
    delayTitle: 'DO NOT DELAY!',
    delayWarning: 'Delaying the marriage of an adult girl is contrary to Islamic teachings! Furthermore, it leads to social difficulties!',

    // App Download
    appDownloadTitle: 'Download Android App',
    appDownloadSub: 'Android App Download',

    // Profile Card
    groomDetails: 'Groom Profile Details',
    brideDetails: 'Bride Profile Details',
    shortlist: 'Choose',
    reject: 'Hide Profile',
    photoCursor: 'Hover cursor over photo',
    photoLogin: 'Login to see image',
    clickHere: 'Click here',
    contactCol: 'Contact :',
    phoneCol: 'Phone',
    rejectedNotice: '(Hidden by you)',
    showAgain: 'Show Again',
    suitableBrideReq: 'Suitable Bride required.',
    suitableGroomReq: 'Suitable Groom required.',
    viewFullProfile: 'View Full Profile ➜',
    closeProfile: 'Close',

    // Card Row Labels
    labelName: 'Name',
    labelAge: 'Age',
    labelEducation: 'Education',
    labelMarital: 'Marital Status',
    labelLocation: 'Residence',
    labelLanguage: 'Mother Tongue',
    labelProfession: 'Profession',
    labelIncome: 'Monthly Income',
    labelHeight: 'Height',
    labelProperty: 'Property',
    labelNative: 'Native Place',
    labelWorkplace: 'Workplace',
    labelCitizenship: 'Citizenship',
    labelResidence: 'Country of Residence',
    labelWorkStatus: 'Work Preference',

    // Section Titles in Details Modal
    personalDetailsTitle: '1. Personal Details',
    fatherDetailsTitle: "2. Father's Details",
    motherDetailsTitle: "3. Mother's Details",
    workPrefTitle: '4. Employment & Work Preferences',
    overseasDetailsTitle: '5. Overseas & Citizenship Details',
    otherDetailsTitle: '6. Other Details',

    // Detailed Personal Field Labels
    workplaceLabel: 'Current Workplace / Place of Business',
    nativePlaceLabel: 'Native Place',
    currentAddressLabel: 'Current Address',
    livingYearsLabel: 'Years Living at Address',
    complexionLabel: 'Complexion / Skin Tone',
    birthOrderLabel: 'Birth Order',
    siblingsCountLabel: 'Number of Siblings',
    siblingDetailsLabel: 'Sibling Details',
    elderSisterLabel: 'Elder Sister',
    youngerSisterLabel: 'Younger Sister',
    elderBrotherLabel: 'Elder Brother',
    youngerBrotherLabel: 'Younger Brother',

    // Detailed Parents Labels
    fatherNameLabel: "Father's Name",
    fatherAgeLabel: "Father's Age",
    fatherJobLabel: "Father's Occupation / Job",
    motherNameLabel: "Mother's Name",
    motherAgeLabel: "Mother's Age",

    // Bride & Groom Work Preferences
    brideWorkPrefLabel: 'Bride Employment Preference',
    groomWorkPrefLabel: "Groom Preference for Bride",
    willWork: 'Will Work',
    willNotWork: 'Will Not Work / Homemaker',
    workIfPermitted: 'Will Work if Permission is Given',
    lookingForWorking: 'Looking for a Working Bride',
    lookingForHomemaker: 'Looking for a Homemaker',
    noPreference: 'No Preference',

    // Other Details
    propertyDetailsLabel: 'Property Details',
    expectationsLabel: 'Expectations / Partner Preferences',

    // Overseas Section & Banner
    overseasSectionTitle: 'Overseas Tamils & Foreign Citizenship Profiles',
    overseasSubtitle: 'Tamil Muslim brides & grooms with citizenship in UK, USA, UAE, Canada, Australia and other nations',
    overseasOnlyNotice: 'Note: Only profiles with legal foreign citizenship are listed in this exclusive overseas category.',
    overseasFilterAll: 'All Overseas Profiles',

    // Modal Registration
    modalRegTitle: 'Free Profile Registration',
    modalRegTypeDomestic: 'Domestic Registration (India)',
    modalRegTypeOverseas: '🌍 Overseas Tamil / Foreign Citizen Registration',
    modalRegOverseasNotice: 'IMPORTANT: Only users holding valid foreign citizenship (UK, USA, UAE, Canada, Australia, etc.) can register under the Overseas Tamil / Foreign Citizen category.',
    modalRegCitizenshipConfirm: 'I confirm that I hold legal citizenship in the selected foreign country.',
    modalRegBanner: 'Register Bride & Groom profile details here completely free of cost.',
    modalRegGenderGroom: 'Groom',
    modalRegGenderBride: 'Bride',
    modalRegName: 'Full Name *',
    modalRegAge: 'Age *',
    modalRegEdu: 'Education Qualification',
    modalRegMarital: 'Marital Status',
    modalRegLoc: 'City / Native District *',
    modalRegLang: 'Mother Tongue',
    modalRegJob: 'Profession / Job',
    modalRegIncome: 'Monthly Income / Salary',
    modalRegHeight: 'Height',
    modalRegProperty: 'Property / Assets',
    modalRegPhone: 'Contact Phone Number *',
    modalRegSubmit: 'Submit Full Profile Registration',

    // App Results
    totalProfiles: 'Total Profiles:',
    shortlistedProfiles: 'Chosen:',
    selectedShortlistDrawer: 'Your Chosen Profiles',
    loadMore: 'Load More Profiles',
    noProfilesFound: 'No profiles found matching your search criteria.',
    adjustFilters: 'Please adjust your filter options and search again.',
    showAllBtn: 'Show All Profiles',

    // Modals
    modalAboutTitle: 'About Us - Tamil Muslim Nikkah',
    modalAboutText1: 'In accordance with Islamic Shariah guidelines, we connect prospective brides and grooms transparently and reliably. Our foremost objective is to facilitate blessed, dowry-free marital matches for all Islamic families in Tamil Nadu and worldwide.',
    modalOurPolicy: 'Our Core Principles:',
    modalPolicy1: 'Strictly zero dowry policy (no giving or taking dowry).',
    modalPolicy2: 'Genuine, verified, and honest profile credentials.',
    modalPolicy3: 'Dedicated and trustworthy family support service.',
    modalClose: 'Close',

    modalContactTitle: 'Contact Us',
    modalPhoneLabel: 'Phone Number',
    modalWhatsAppLabel: 'WhatsApp Support',
    modalWhatsAppDirect: '+91 91718 96625 (Direct Chat)',
    modalWorkHoursLabel: 'Working Hours',
    modalWorkHoursVal: '9.00 AM to 9.00 PM (All 7 Days)',

    modalLoginDesc: 'Please Log In to view full contact numbers and complete matrimonial details.',

    modalVideoTitle: 'How to Login? (Video Guide)',
    modalVideoStep1: '1. Enter your registered mobile phone number',
    modalVideoStep2: '2. Enter your password and click Login button',
    modalVideoStep3: '3. Access full details of verified brides & grooms',

    // Footer
    footerAbout: 'Operating strictly under Islamic Shariah ethics, connecting verified, dowry-free Nikah matrimonial proposals for Tamil and worldwide Muslim families.',
    footerVerified: '100% Verified & Genuine Muslim Profiles',
    footerServicesTitle: 'Our Services',
    footerService1: 'Free Registration for Brides & Grooms',
    footerService2: 'Complete Photo Privacy Protection for Sisters',
    footerService3: 'Dedicated Section for Remarriage & Divorced',
    footerService4: 'Special Section for Overseas Tamils & Foreign Citizens',
    footerService5: 'Guidance for Sunnah Dowry-Free Marriage',
    footerTimingsTitle: 'Contact & Timings',
    footerAllDays: '(All 7 Days)',
    footerHelpDesk: 'Helpdesk Phone:',
    footerGuidelinesTitle: 'Islamic Matrimonial Guidelines',
    footerFreeRegBtn: 'Free Registration',
    footerTerms: 'Terms of Service',
    footerLogin: 'User Login',

    // Admin & Super Admin Portal
    superAdminPortalTitle: 'Tamil Muslim Nikkah - SUPER ADMIN',
    adminPortalTitle: 'Tamil Muslim Nikkah - ADMIN',
    adminAccessOnlyDesc: 'Administrative Access Only',
    superAdminPromptText: '🔒 Enter Super Admin credentials to proceed',
    adminPromptText: '🔒 Enter Admin credentials to proceed',
    adminUsernameLabel: 'Username',
    adminPasswordLabel: 'Password',
    adminChecking: 'Verifying...',
    superAdminLoginBtn: 'Sign In (Super Admin Login)',
    adminLoginBtn: 'Sign In (Admin Login)',
    returnToWebBtn: '← Return to Website',
    adminPortalSubTitle: 'Registered Candidates & Administrative Verification Portal',
    superAdminPortalSubTitle: 'Registered Candidates View Portal (All Users Details)',
    adminRefreshBtn: 'Refresh',
    adminUserSideBtn: 'Go to User Site',
    adminLogoutBtn: 'Logout',
    adminRegistryBanner: 'Registered Candidates Registry',
    adminTotalCandidates: 'Total Profiles',
    adminPendingCount: 'Pending Verifications',
    adminSearchPlaceholder: 'Search by Name / Nikah ID / Phone...',
    adminTabAll: 'All Profiles',
    adminTabPending: 'Pending Verification',
    adminTabVerified: 'Live on Website',
    adminVerificationNotice: 'Administrative Verification Rule: Newly registered profiles will be visible on the public user website only after an Admin clicks "Verify".',
    superAdminViewNotice: 'Super Admin View Portal: This portal is exclusively for viewing all registered candidate details. To verify or remove candidates, please use the Admin portal (/admin).',
    adminTableTitle: 'Registered Candidates',
    superAdminViewOnlyBadge: 'Super Admin (View Only)',
    adminManageBadge: 'Admin Management',
    adminColNikahId: 'Nikah ID',
    adminColName: 'Candidate Name',
    adminColGenderAge: 'Gender & Age',
    adminColPhone: 'Mobile Number',
    adminColDistrict: 'District / City',
    adminColStatus: 'Verification Status',
    adminColActions: 'Actions',
    adminColViewOnly: 'Details',
    adminBtnDetails: 'Details',
    adminBtnVerify: 'Verify',
    adminBtnDelete: 'Delete',
    adminBtnRevoke: 'Revoke',
    adminStatusPending: 'Pending Verification',
    adminStatusVerified: 'Verified (Live)',
    adminStatusRejected: 'Rejected',
    adminSuperAdminViewOnlyTag: '👁 View Only Mode',
    adminDeleteModalTitle: 'Permanently Delete User Profile?',
    adminDeleteModalDesc: 'Are you sure you want to permanently remove this user account?',
    adminDeleteModalWarn: '⚠ This action cannot be undone. All candidate information, documents, and photos will be permanently removed.',
    adminDeleteCancel: 'Cancel',
    adminDeleteConfirm: 'Yes, Delete User',
    adminCloseModal: 'Close',
  }
};

// Common profile values translations (for dynamic values, dropdown choices, and profile cards)
export const profileValueTranslations = {
  // Genders
  'மணமகன்': { ta: 'மணமகன்', en: 'Groom' },
  'மணமகள்': { ta: 'மணமகள்', en: 'Bride' },
  'Groom': { ta: 'மணமகன்', en: 'Groom' },
  'Bride': { ta: 'மணமகள்', en: 'Bride' },

  // Marital Status
  'திருமணம் ஆகாதவர்': { ta: 'திருமணம் ஆகாதவர்', en: 'Unmarried' },
  'Un married': { ta: 'திருமணம் ஆகாதவர்', en: 'Unmarried' },
  'Unmarried': { ta: 'திருமணம் ஆகாதவர்', en: 'Unmarried' },
  'Never Married': { ta: 'திருமணம் ஆகாதவர்', en: 'Never Married' },
  'Single': { ta: 'திருமணம் ஆகாதவர்', en: 'Single' },
  'விவாகரத்து ஆனவர்': { ta: 'விவாகரத்து ஆனவர்', en: 'Divorced' },
  'Divorced': { ta: 'விவாகரத்து ஆனவர்', en: 'Divorced' },
  'விவாகரத்து கோரியவர்': { ta: 'விவாகரத்து கோரியவர்', en: 'Applied for Divorce' },
  'Applied for divorce': { ta: 'விவாகரத்து கோரியவர்', en: 'Applied for Divorce' },
  'துணையை இழந்தவர்': { ta: 'துணையை இழந்தவர்', en: 'Bereaved of Partner' },
  'Bereaved of a partner': { ta: 'துணையை இழந்தவர்', en: 'Bereaved of Partner' },
  'Widowed': { ta: 'துணையை இழந்தவர்', en: 'Widowed' },
  'Widower': { ta: 'துணையை இழந்தவர்', en: 'Widower' },
  'Widow': { ta: 'துணையை இழந்தவர்', en: 'Widow' },
  'மறுமணம்': { ta: 'மறுமணம்', en: 'Remarriage' },
  'Remarriage': { ta: 'மறுமணம்', en: 'Remarriage' },
  'Additional Marriage': { ta: 'கூடுதல் திருமணம் / மறுமணம்', en: 'Additional Marriage' },
  'கூடுதல் திருமணம் / மறுமணம்': { ta: 'கூடுதல் திருமணம் / மறுமணம்', en: 'Additional Marriage' },

  // Languages / Community
  'தமிழ்-முஸ்லிம்': { ta: 'தமிழ்-முஸ்லிம்', en: 'Tamil-Muslim' },
  'Tamil-Muslim': { ta: 'தமிழ்-முஸ்லிம்', en: 'Tamil-Muslim' },
  'Tamil Muslim': { ta: 'தமிழ்-முஸ்லிம்', en: 'Tamil-Muslim' },
  'உருது-முஸ்லிம்': { ta: 'உருது-முஸ்லிம்', en: 'Urdu-Muslim' },
  'Urdu-Muslim': { ta: 'உருது-முஸ்லிம்', en: 'Urdu-Muslim' },
  'Urdu Muslim': { ta: 'உருது-முஸ்லிம்', en: 'Urdu-Muslim' },
  'தமிழ்-உருது முஸ்லிம்': { ta: 'தமிழ்-உருது முஸ்லிம்', en: 'Tamil-Urdu Muslim' },
  'Tamil-Urdu Muslim': { ta: 'தமிழ்-உருது முஸ்லிம்', en: 'Tamil-Urdu Muslim' },
  'கேரளா-முஸ்லிம்': { ta: 'கேரளா-முஸ்லிம்', en: 'Kerala-Muslim' },
  'Kerala-Muslim': { ta: 'கேரளா-முஸ்லிம்', en: 'Kerala-Muslim' },
  'மலையாள முஸ்லிம்': { ta: 'மலையாள முஸ்லிம்', en: 'Malayalam-Muslim' },
  'Malayalam-Muslim': { ta: 'மலையாள முஸ்லிம்', en: 'Malayalam-Muslim' },

  // Publisher Relationships
  'Self': { ta: 'சுய பதிவு', en: 'Self' },
  'சுய பதிவு': { ta: 'சுய பதிவு', en: 'Self' },
  'Father': { ta: 'தந்தை', en: 'Father' },
  'தந்தை': { ta: 'தந்தை', en: 'Father' },
  'Mother': { ta: 'தாய்', en: 'Mother' },
  'தாய்': { ta: 'தாய்', en: 'Mother' },
  'Brother': { ta: 'சகோதரன்', en: 'Brother' },
  'சகோதரன்': { ta: 'சகோதரன்', en: 'Brother' },
  'Sister': { ta: 'சகோதரி', en: 'Sister' },
  'சகோதரி': { ta: 'சகோதரி', en: 'Sister' },
  'Guardian': { ta: 'பாதுகாவலர்', en: 'Guardian' },
  'பாதுகாவலர்': { ta: 'பாதுகாவலர்', en: 'Guardian' },
  'Relative': { ta: 'உறவினர்', en: 'Relative' },
  'உறவினர்': { ta: 'உறவினர்', en: 'Relative' },
  'Other': { ta: 'பிறர்', en: 'Other' },
  'பிறர்': { ta: 'பிறர்', en: 'Other' },

  // Citizenships
  'UK Citizen': { ta: 'UK Citizen (இங்கிலாந்து)', en: 'UK Citizen' },
  'US Citizen': { ta: 'US Citizen (அமெரிக்கா)', en: 'US Citizen' },
  'UAE Citizen': { ta: 'UAE Citizen (அமீரகம்)', en: 'UAE Citizen' },
  'Canadian Citizen': { ta: 'Canadian Citizen (கனடா)', en: 'Canadian Citizen' },
  'Australian Citizen': { ta: 'Australian Citizen (ஆஸ்திரேலியா)', en: 'Australian Citizen' },
  'Other Foreign Citizen': { ta: 'Other Foreign Citizen (பிற நாடு)', en: 'Other Foreign Citizen' },
  'Indian Citizen': { ta: 'Indian Citizen (இந்தியா)', en: 'Indian Citizen' },

  // Countries
  'UK': { ta: 'UK (இங்கிலாந்து)', en: 'United Kingdom' },
  'United Kingdom': { ta: 'இங்கிலாந்து (UK)', en: 'United Kingdom' },
  'இங்கிலாந்து': { ta: 'இங்கிலாந்து (UK)', en: 'United Kingdom' },
  'USA': { ta: 'USA (அமெரிக்கா)', en: 'USA' },
  'United States': { ta: 'அமெரிக்கா (USA)', en: 'USA' },
  'அமெரிக்கா': { ta: 'அமெரிக்கா (USA)', en: 'USA' },
  'UAE': { ta: 'UAE (அமீரகம்)', en: 'UAE (Dubai / Abu Dhabi)' },
  'அமீரகம்': { ta: 'அமீரகம் (UAE)', en: 'UAE' },
  'Canada': { ta: 'Canada (கனடா)', en: 'Canada' },
  'கனடா': { ta: 'Canada (கனடா)', en: 'Canada' },
  'Australia': { ta: 'Australia (ஆஸ்திரேலியா)', en: 'Australia' },
  'ஆஸ்திரேலியா': { ta: 'Australia (ஆஸ்திரேலியா)', en: 'Australia' },
  'India': { ta: 'இந்தியா', en: 'India' },
  'இந்தியா': { ta: 'இந்தியா', en: 'India' },
  'இந்தியா (India)': { ta: 'இந்தியா (India)', en: 'India' },
  'Saudi Arabia': { ta: 'சவூதி அரேபியா', en: 'Saudi Arabia' },
  'சவூதி அரேபியா': { ta: 'சவூதி அரேபியா', en: 'Saudi Arabia' },
  'Qatar': { ta: 'கத்தார்', en: 'Qatar' },
  'கத்தார்': { ta: 'கத்தார்', en: 'Qatar' },
  'Kuwait': { ta: 'குவைத்', en: 'Kuwait' },
  'குவைத்': { ta: 'குவைத்', en: 'Kuwait' },
  'Oman': { ta: 'ஓமன்', en: 'Oman' },
  'ஓமன்': { ta: 'ஓமன்', en: 'Oman' },
  'Bahrain': { ta: 'பஹ்ரைன்', en: 'Bahrain' },
  'பஹ்ரைன்': { ta: 'பஹ்ரைன்', en: 'Bahrain' },
  'Singapore': { ta: 'சிங்கப்பூர்', en: 'Singapore' },
  'சிங்கப்பூர்': { ta: 'சிங்கப்பூர்', en: 'Singapore' },
  'Malaysia': { ta: 'மலேசியா', en: 'Malaysia' },
  'மலேசியா': { ta: 'மலேசியா', en: 'Malaysia' },

  // Bride Work Status
  'வேலைக்கு செல்வார்': { ta: 'வேலைக்கு செல்வார்', en: 'Will Work' },
  'Will Work': { ta: 'வேலைக்கு செல்வார்', en: 'Will Work' },
  'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி': { ta: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி', en: 'Will Not Work / Homemaker' },
  'Will Not Work / Homemaker': { ta: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி', en: 'Will Not Work / Homemaker' },
  'Will Not Work': { ta: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி', en: 'Will Not Work / Homemaker' },
  'வேலைக்கு செல்ல மாட்டார்': { ta: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி', en: 'Will Not Work / Homemaker' },
  'அனுமதி தந்தால் வேலைக்கு செல்வார்': { ta: 'அனுமதி தந்தால் வேலைக்கு செல்வார்', en: 'Will Work if Permission is Given' },
  'Will Work if Permission is Given': { ta: 'அனுமதி தந்தால் வேலைக்கு செல்வார்', en: 'Will Work if Permission is Given' },
  'Will Work if Permitted': { ta: 'அனுமதி தந்தால் வேலைக்கு செல்வார்', en: 'Will Work if Permitted' },

  // Groom Work Preferences
  'வேலை பார்க்கும் மணமகள் தேவை': { ta: 'வேலை பார்க்கும் மணமகள் தேவை', en: 'Looking for a Working Bride' },
  'Looking for a Working Bride': { ta: 'வேலை பார்க்கும் மணமகள் தேவை', en: 'Looking for a Working Bride' },
  'இல்லத்தரசி மணமகள் தேவை': { ta: 'இல்லத்தரசி மணமகள் தேவை', en: 'Looking for a Homemaker' },
  'Looking for a Homemaker': { ta: 'இல்லத்தரசி மணமகள் தேவை', en: 'Looking for a Homemaker' },
  'விருப்பம் / நிபந்தனை இல்லை': { ta: 'விருப்பம் / நிபந்தனை இல்லை', en: 'No Preference' },
  'No Preference': { ta: 'விருப்பம் / நிபந்தனை இல்லை', en: 'No Preference' },

  // Complexion
  'சிகப்பு': { ta: 'சிகப்பு', en: 'Fair' },
  'Fair': { ta: 'சிகப்பு', en: 'Fair' },
  'மாநிறம்': { ta: 'மாநிறம்', en: 'Wheatish' },
  'Wheatish': { ta: 'மாநிறம்', en: 'Wheatish' },
  'மாநிறம்-சிகப்பு': { ta: 'மாநிறம்-சிகப்பு', en: 'Medium Fair' },
  'Medium Fair': { ta: 'மாநிறம்-சிகப்பு', en: 'Medium Fair' },
  'மிகச் சிகப்பு': { ta: 'மிகச் சிகப்பு', en: 'Very Fair' },
  'Very Fair': { ta: 'மிகச் சிகப்பு', en: 'Very Fair' },

  // Birth Orders
  'மூத்தவர் (1-வது பிள்ளை)': { ta: 'மூத்தவர் (1-வது பிள்ளை)', en: 'Eldest (1st Child)' },
  'Eldest (1st Child)': { ta: 'மூத்தவர் (1-வது பிள்ளை)', en: 'Eldest (1st Child)' },
  'Eldest': { ta: 'மூத்தவர் (1-வது பிள்ளை)', en: 'Eldest (1st Child)' },
  '2-வது பிள்ளை': { ta: '2-வது பிள்ளை', en: '2nd Child' },
  '2nd Child': { ta: '2-வது பிள்ளை', en: '2nd Child' },
  '3-வது பிள்ளை': { ta: '3-வது பிள்ளை', en: '3rd Child' },
  '3rd Child': { ta: '3-வது பிள்ளை', en: '3rd Child' },
  'இளையவர் (கடைசிப் பிள்ளை)': { ta: 'இளையவர் (கடைசிப் பிள்ளை)', en: 'Youngest Child' },
  'Youngest Child': { ta: 'இளையவர் (கடைசிப் பிள்ளை)', en: 'Youngest Child' },
  'Youngest': { ta: 'இளையவர் (கடைசிப் பிள்ளை)', en: 'Youngest Child' },
  'ஒரே பிள்ளை': { ta: 'ஒரே பிள்ளை', en: 'Only Child' },
  'Only Child': { ta: 'ஒரே பிள்ளை', en: 'Only Child' },

  // Locations / Districts / Workplace
  'அனைத்து ஊர்களும்': { ta: 'அனைத்து ஊர்களும்', en: 'All Cities / Districts' },
  'All Cities / Districts': { ta: 'அனைத்து ஊர்களும்', en: 'All Cities / Districts' },
  'All Cities': { ta: 'அனைத்து ஊர்களும்', en: 'All Cities / Districts' },
  'சென்னை': { ta: 'சென்னை', en: 'Chennai' },
  'Chennai': { ta: 'சென்னை', en: 'Chennai' },
  'மதுரை': { ta: 'மதுரை', en: 'Madurai' },
  'Madurai': { ta: 'மதுரை', en: 'Madurai' },
  'திருச்சி': { ta: 'திருச்சி', en: 'Trichy' },
  'Trichy': { ta: 'திருச்சி', en: 'Trichy' },
  'Tiruchirappalli': { ta: 'திருச்சி', en: 'Trichy' },
  'திருநெல்வேலி': { ta: 'திருநெல்வேலி', en: 'Tirunelveli' },
  'Tirunelveli': { ta: 'திருநெல்வேலி', en: 'Tirunelveli' },
  'ராமநாதபுரம்': { ta: 'ராமநாதபுரம்', en: 'Ramanathapuram' },
  'Ramanathapuram': { ta: 'ராமநாதபுரம்', en: 'Ramanathapuram' },
  'அபிராமம் - ராமநாதபுரம்': { ta: 'அபிராமம் - ராமநாதபுரம்', en: 'Abiramam - Ramanathapuram' },
  'Abiramam - Ramanathapuram': { ta: 'அபிராமம் - ராமநாதபுரம்', en: 'Abiramam - Ramanathapuram' },
  'அபிராமம்': { ta: 'அபிராமம்', en: 'Abiramam' },
  'Abiramam': { ta: 'அபிராமம்', en: 'Abiramam' },
  'கோயம்புத்தூர்': { ta: 'கோயம்புத்தூர்', en: 'Coimbatore' },
  'Coimbatore': { ta: 'கோயம்புத்தூர்', en: 'Coimbatore' },
  'தஞ்சாவூர்': { ta: 'தஞ்சாவூர்', en: 'Thanjavur' },
  'Thanjavur': { ta: 'தஞ்சாவூர்', en: 'Thanjavur' },
  'வேலூர்': { ta: 'வேலூர்', en: 'Vellore' },
  'Vellore': { ta: 'வேலூர்', en: 'Vellore' },
  'திண்டுக்கல்': { ta: 'திண்டுக்கல்', en: 'Dindigul' },
  'Dindigul': { ta: 'திண்டுக்கல்', en: 'Dindigul' },
  'நாகப்பட்டினம்': { ta: 'நாகப்பட்டினம்', en: 'Nagapattinam' },
  'Nagapattinam': { ta: 'நாகப்பட்டினம்', en: 'Nagapattinam' },
  'சேலம்': { ta: 'சேலம்', en: 'Salem' },
  'Salem': { ta: 'சேலம்', en: 'Salem' },
  'திருவாரூர்': { ta: 'திருவாரூர்', en: 'Tiruvarur' },
  'Tiruvarur': { ta: 'திருவாரூர்', en: 'Tiruvarur' },
  'காரைக்குடி': { ta: 'காரைக்குடி', en: 'Karaikudi' },
  'Karaikudi': { ta: 'காரைக்குடி', en: 'Karaikudi' },
  'புதுக்கோட்டை': { ta: 'புதுக்கோட்டை', en: 'Pudukkottai' },
  'Pudukkottai': { ta: 'புதுக்கோட்டை', en: 'Pudukkottai' },
  'காயல்பட்டினம்': { ta: 'காயல்பட்டினம்', en: 'Kayalpatnam' },
  'Kayalpatnam': { ta: 'காயல்பட்டினம்', en: 'Kayalpatnam' },
  'அதிராம்பட்டினம்': { ta: 'அதிராம்பட்டினம்', en: 'Adirampattinam' },
  'Adirampattinam': { ta: 'அதிராம்பட்டினம்', en: 'Adirampattinam' },
  'வாணியம்பாடி': { ta: 'வாணியம்பாடி', en: 'Vaniyambadi' },
  'Vaniyambadi': { ta: 'வாணியம்பாடி', en: 'Vaniyambadi' },
  'ஆம்பூர்': { ta: 'ஆம்பூர்', en: 'Ambur' },
  'Ambur': { ta: 'ஆம்பூர்', en: 'Ambur' },
  'திருப்பூர்': { ta: 'திருப்பூர்', en: 'Tirupur' },
  'Tirupur': { ta: 'திருப்பூர்', en: 'Tirupur' },
  'ஈரோடு': { ta: 'ஈரோடு', en: 'Erode' },
  'Erode': { ta: 'ஈரோடு', en: 'Erode' },
  'காஞ்சிபுரம்': { ta: 'காஞ்சிபுரம்', en: 'Kanchipuram' },
  'Kanchipuram': { ta: 'காஞ்சிபுரம்', en: 'Kanchipuram' },
  'திருவள்ளூர்': { ta: 'திருவள்ளூர்', en: 'Tiruvallur' },
  'Tiruvallur': { ta: 'திருவள்ளூர்', en: 'Tiruvallur' },
  'கடலூர்': { ta: 'கடலூர்', en: 'Cuddalore' },
  'Cuddalore': { ta: 'கடலூர்', en: 'Cuddalore' },
  'விழுப்புரம்': { ta: 'விழுப்புரம்', en: 'Villupuram' },
  'Villupuram': { ta: 'விழுப்புரம்', en: 'Villupuram' },
  'சிவகங்கை': { ta: 'சிவகங்கை', en: 'Sivagangai' },
  'Sivagangai': { ta: 'சிவகங்கை', en: 'Sivagangai' },
  'விருதுநகர்': { ta: 'விருதுநகர்', en: 'Virudhunagar' },
  'Virudhunagar': { ta: 'விருதுநகர்', en: 'Virudhunagar' },
  'தூத்துக்குடி': { ta: 'தூத்துக்குடி', en: 'Thoothukudi' },
  'Thoothukudi': { ta: 'தூத்துக்குடி', en: 'Thoothukudi' },
  'Tuticorin': { ta: 'தூத்துக்குடி', en: 'Thoothukudi' },
  'தென்காசி': { ta: 'தென்காசி', en: 'Tenkasi' },
  'Tenkasi': { ta: 'தென்காசி', en: 'Tenkasi' },
  'கன்னியாகுமரி': { ta: 'கன்னியாகுமரி', en: 'Kanyakumari' },
  'Kanyakumari': { ta: 'கன்னியாகுமரி', en: 'Kanyakumari' },
  'நீலகிரி': { ta: 'நீலகிரி', en: 'Nilgiris' },
  'Nilgiris': { ta: 'நீலகிரி', en: 'Nilgiris' },
  'தேனி': { ta: 'தேனி', en: 'Theni' },
  'Theni': { ta: 'தேனி', en: 'Theni' },
  'கரூர்': { ta: 'கரூர்', en: 'Karur' },
  'Karur': { ta: 'கரூர்', en: 'Karur' },
  'பெரம்பலூர்': { ta: 'பெரம்பலூர்', en: 'Perambalur' },
  'Perambalur': { ta: 'பெரம்பலூர்', en: 'Perambalur' },
  'அரியலூர்': { ta: 'அரியலூர்', en: 'Ariyalur' },
  'Ariyalur': { ta: 'அரியலூர்', en: 'Ariyalur' },
  'திருவண்ணாமலை': { ta: 'திருவண்ணாமலை', en: 'Tiruvannamalai' },
  'Tiruvannamalai': { ta: 'திருவண்ணாமலை', en: 'Tiruvannamalai' },
  'தர்மபுரி': { ta: 'தர்மபுரி', en: 'Dharmapuri' },
  'Dharmapuri': { ta: 'தர்மபுரி', en: 'Dharmapuri' },
  'கிருஷ்ணகிரி': { ta: 'கிருஷ்ணகிரி', en: 'Krishnagiri' },
  'Krishnagiri': { ta: 'கிருஷ்ணகிரி', en: 'Krishnagiri' },
  'ராணிப்பேட்டை': { ta: 'ராணிப்பேட்டை', en: 'Ranipet' },
  'Ranipet': { ta: 'ராணிப்பேட்டை', en: 'Ranipet' },
  'திருப்பத்தூர்': { ta: 'திருப்பத்தூர்', en: 'Tirupattur' },
  'Tirupattur': { ta: 'திருப்பத்தூர்', en: 'Tirupattur' },
  'செங்கல்பட்டு': { ta: 'செங்கல்பட்டு', en: 'Chengalpattu' },
  'Chengalpattu': { ta: 'செங்கல்பட்டு', en: 'Chengalpattu' },
  'கள்ளக்குறிச்சி': { ta: 'கள்ளக்குறிச்சி', en: 'Kallakurichi' },
  'Kallakurichi': { ta: 'கள்ளக்குறிச்சி', en: 'Kallakurichi' },
  'மயிலாடுதுறை': { ta: 'மயிலாடுதுறை', en: 'Mayiladuthurai' },
  'Mayiladuthurai': { ta: 'மயிலாடுதுறை', en: 'Mayiladuthurai' },
  'கீழக்கரை': { ta: 'கீழக்கரை', en: 'Kilakarai' },
  'Kilakarai': { ta: 'கீழக்கரை', en: 'Kilakarai' },
  'இளையான்குடி': { ta: 'இளையான்குடி', en: 'Ilayangudi' },
  'Ilayangudi': { ta: 'இளையான்குடி', en: 'Ilayangudi' },
  'பரமக்குடி': { ta: 'பரமக்குடி', en: 'Paramakudi' },
  'Paramakudi': { ta: 'பரமக்குடி', en: 'Paramakudi' },
  'மேலப்பாளையம்': { ta: 'மேலப்பாளையம்', en: 'Melapalayam' },
  'Melapalayam': { ta: 'மேலப்பாளையம்', en: 'Melapalayam' },
  'லால்பேட்டை': { ta: 'லால்பேட்டை', en: 'Lalpet' },
  'Lalpet': { ta: 'லால்பேட்டை', en: 'Lalpet' },
  'கூத்தநல்லூர்': { ta: 'கூத்தநல்லூர்', en: 'Koothanallur' },
  'Koothanallur': { ta: 'கூத்தநல்லூர்', en: 'Koothanallur' },
  'பட்டுக்கோட்டை': { ta: 'பட்டுக்கோட்டை', en: 'Pattukkottai' },
  'Pattukkottai': { ta: 'பட்டுக்கோட்டை', en: 'Pattukkottai' },
  'பெங்களூரு': { ta: 'பெங்களூரு', en: 'Bangalore' },
  'Bangalore': { ta: 'பெங்களூரு', en: 'Bangalore' },
  'Bengaluru': { ta: 'பெங்களூரு', en: 'Bangalore' },
  'ஹைதராபாத்': { ta: 'ஹைதராபாத்', en: 'Hyderabad' },
  'Hyderabad': { ta: 'ஹைதராபாத்', en: 'Hyderabad' },
  'மும்பை': { ta: 'மும்பை', en: 'Mumbai' },
  'Mumbai': { ta: 'மும்பை', en: 'Mumbai' },
  'Bombay': { ta: 'மும்பை', en: 'Mumbai' },
  'டெல்லி': { ta: 'டெல்லி', en: 'Delhi' },
  'Delhi': { ta: 'டெல்லி', en: 'Delhi' },
  'கேரளா': { ta: 'கேரளா', en: 'Kerala' },
  'Kerala': { ta: 'கேரளா', en: 'Kerala' },
  'துபாய்': { ta: 'துபாய்', en: 'Dubai' },
  'Dubai': { ta: 'துபாய்', en: 'Dubai' },
  'அபுதாபி': { ta: 'அபுதாபி', en: 'Abu Dhabi' },
  'Abu Dhabi': { ta: 'அபுதாபி', en: 'Abu Dhabi' },
  'ஷார்ஜா': { ta: 'ஷார்ஜா', en: 'Sharjah' },
  'Sharjah': { ta: 'ஷார்ஜா', en: 'Sharjah' },
  'ரியாத்': { ta: 'ரியாத்', en: 'Riyadh' },
  'Riyadh': { ta: 'ரியாத்', en: 'Riyadh' },
  'ஜெத்தா': { ta: 'ஜெத்தா', en: 'Jeddah' },
  'Jeddah': { ta: 'ஜெத்தா', en: 'Jeddah' },
  'தம்மாம்': { ta: 'தம்மாம்', en: 'Dammam' },
  'Dammam': { ta: 'தம்மாம்', en: 'Dammam' },
  'தோஹா': { ta: 'தோஹா', en: 'Doha' },
  'Doha': { ta: 'தோஹா', en: 'Doha' },
  'மஸ்கட்': { ta: 'மஸ்கட்', en: 'Muscat' },
  'Muscat': { ta: 'மஸ்கட்', en: 'Muscat' },
  'கோலாலம்பூர்': { ta: 'கோலாலம்பூர்', en: 'Kuala Lumpur' },
  'Kuala Lumpur': { ta: 'கோலாலம்பூர்', en: 'Kuala Lumpur' },
  'லண்டன்': { ta: 'லண்டன்', en: 'London' },
  'London': { ta: 'லண்டன்', en: 'London' },

  // Education Qualifications
  '+2': { ta: '+2 (மேல்நிலை)', en: '+2 (HSC)' },
  '+2 (HSC)': { ta: '+2 (மேல்நிலை)', en: '+2 (HSC)' },
  '12th': { ta: '+2 (மேல்நிலை)', en: '+2 (HSC)' },
  'HSC': { ta: '+2 (மேல்நிலை)', en: '+2 (HSC)' },
  '8ஆம் தரநிலை': { ta: '8-ஆம் வகுப்பு', en: '8th Standard' },
  '8th Standard': { ta: '8-ஆம் வகுப்பு', en: '8th Standard' },
  '8th': { ta: '8-ஆம் வகுப்பு', en: '8th Standard' },
  '10ஆம் வகுப்பு': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  '10ஆம் வகுப்பு (SSLC)': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  '10th Standard': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  '10th Standard (SSLC)': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  '10th': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  'SSLC': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  'டிப்ளமோ': { ta: 'டிப்ளமோ', en: 'Diploma' },
  'Diploma': { ta: 'டிப்ளமோ', en: 'Diploma' },
  'டி.எம்.இ': { ta: 'டி.எம்.இ (DME)', en: 'DME' },
  'DME': { ta: 'டி.எம்.இ (DME)', en: 'DME' },
  'DME (Mech Engg)': { ta: 'டி.எம்.இ', en: 'DME (Mech Engg)' },
  'பட்டதாரி (Degree)': { ta: 'பட்டதாரி', en: 'Graduate (Degree)' },
  'பட்டதாரி': { ta: 'பட்டதாரி', en: 'Graduate' },
  'Graduate': { ta: 'பட்டதாரி', en: 'Graduate' },
  'Degree': { ta: 'பட்டதாரி', en: 'Graduate' },
  'முதுகலை (PG)': { ta: 'முதுகலை', en: 'Post Graduate (PG)' },
  'முதுகலை': { ta: 'முதுகலை', en: 'Post Graduate' },
  'Post Graduate': { ta: 'முதுகலை', en: 'Post Graduate' },
  'Post Graduate (PG)': { ta: 'முதுகலை', en: 'Post Graduate (PG)' },
  'PG': { ta: 'முதுகலை', en: 'PG' },
  'இன்ஜினியரிங் (BE/B.Tech)': { ta: 'இன்ஜினியரிங் (BE/B.Tech)', en: 'Engineering (BE/B.Tech)' },
  'Engineering (BE/B.Tech)': { ta: 'இன்ஜினியரிங் (BE/B.Tech)', en: 'Engineering (BE/B.Tech)' },
  'Engineering': { ta: 'பொறியியல் / இன்ஜினியரிங்', en: 'Engineering' },
  'B.E / B.Tech': { ta: 'பி.இ / பி.டெக்', en: 'B.E / B.Tech' },
  'BE / BTech': { ta: 'பி.இ / பி.டெக்', en: 'B.E / B.Tech' },
  'B.E / B.Tech / MBA / MBBS / Arts': { ta: 'பி.இ / பி.டெக் / எம்பிஏ / எம்பிபிஎஸ்', en: 'B.E / B.Tech / MBA / MBBS / Arts' },
  'பி.இ / பி.டெக்': { ta: 'பி.இ / பி.டெக்', en: 'B.E / B.Tech' },
  'B.E': { ta: 'பி.இ (B.E)', en: 'B.E' },
  'BE': { ta: 'பி.இ (B.E)', en: 'B.E' },
  'பி.இ': { ta: 'பி.இ (B.E)', en: 'B.E' },
  'B.Tech': { ta: 'பி.டெக் (B.Tech)', en: 'B.Tech' },
  'BTech': { ta: 'பி.டெக் (B.Tech)', en: 'B.Tech' },
  'பி.டெக்': { ta: 'பி.டெக் (B.Tech)', en: 'B.Tech' },
  'M.E': { ta: 'எம்.இ (M.E)', en: 'M.E' },
  'ME': { ta: 'எம்.இ (M.E)', en: 'M.E' },
  'M.Tech': { ta: 'எம்.டெக் (M.Tech)', en: 'M.Tech' },
  'MTech': { ta: 'எம்.டெக் (M.Tech)', en: 'M.Tech' },
  'மருத்துவம் / நர்சிங்': { ta: 'மருத்துவம் / நர்சிங்', en: 'Medical / Nursing' },
  'Medical / Nursing': { ta: 'மருத்துவம் / நர்சிங்', en: 'Medical / Nursing' },
  'பி.எஸ்.சி.': { ta: 'பி.எஸ்சி', en: 'B.Sc.' },
  'பி.எஸ்சி': { ta: 'பி.எஸ்சி', en: 'B.Sc' },
  'B.Sc.': { ta: 'பி.எஸ்சி', en: 'B.Sc.' },
  'B.Sc': { ta: 'பி.எஸ்சி', en: 'B.Sc' },
  'BSc': { ta: 'பி.எஸ்சி', en: 'B.Sc' },
  'பி.இ. மெக்கானிக்கல்': { ta: 'பி.இ. மெக்கானிக்கல்', en: 'B.E. Mechanical' },
  'B.E. Mechanical': { ta: 'பி.இ. மெக்கானிக்கல்', en: 'B.E. Mechanical' },
  'பி.டெக் (IT)': { ta: 'பி.டெக் (IT)', en: 'B.Tech (IT)' },
  'B.Tech (IT)': { ta: 'பி.டெக் (IT)', en: 'B.Tech (IT)' },
  'எம்.காம்.': { ta: 'எம்.காம்', en: 'M.Com.' },
  'எம்.காம்': { ta: 'எம்.காம்', en: 'M.Com' },
  'M.Com.': { ta: 'எம்.காம்', en: 'M.Com.' },
  'M.Com': { ta: 'எம்.காம்', en: 'M.Com' },
  'MCom': { ta: 'எம்.காம்', en: 'M.Com' },
  'எம்.ஏ. ஆங்கிலம்': { ta: 'எம்.ஏ. ஆங்கிலம்', en: 'M.A. English' },
  'M.A. English': { ta: 'எம்.ஏ. ஆங்கிலம்', en: 'M.A. English' },
  'பி.எஸ்சி நர்சிங்': { ta: 'பி.எஸ்சி நர்சிங்', en: 'B.Sc. Nursing' },
  'B.Sc. Nursing': { ta: 'பி.எஸ்சி நர்சிங்', en: 'B.Sc. Nursing' },
  'B.Sc Nursing': { ta: 'பி.எஸ்சி நர்சிங்', en: 'B.Sc Nursing' },
  'Nursing': { ta: 'நர்சிங்', en: 'Nursing' },
  'நர்சிங்': { ta: 'நர்சிங்', en: 'Nursing' },
  'எம்.பி.ஏ': { ta: 'எம்.பி.ஏ', en: 'MBA' },
  'MBA': { ta: 'எம்.பி.ஏ', en: 'MBA' },
  'பி.சி.ஏ': { ta: 'பி.சி.ஏ', en: 'BCA' },
  'BCA': { ta: 'பி.சி.ஏ', en: 'BCA' },
  'எம்.சி.ஏ': { ta: 'எம்.சி.ஏ', en: 'MCA' },
  'MCA': { ta: 'எம்.சி.ஏ', en: 'MCA' },
  'பி.எட்.': { ta: 'பி.எட்', en: 'B.Ed.' },
  'பி.எட்': { ta: 'பி.எட்', en: 'B.Ed' },
  'B.Ed.': { ta: 'பி.எட்', en: 'B.Ed.' },
  'B.Ed': { ta: 'பி.எட்', en: 'B.Ed' },
  'M.Ed': { ta: 'எம்.எட்', en: 'M.Ed' },
  'எம்.எஸ்.சி.': { ta: 'எம்.எஸ்சி', en: 'M.Sc.' },
  'எம்.எஸ்சி': { ta: 'எம்.எஸ்சி', en: 'M.Sc' },
  'M.Sc.': { ta: 'எம்.எஸ்சி', en: 'M.Sc.' },
  'M.Sc': { ta: 'எம்.எஸ்சி', en: 'M.Sc' },
  'MSc': { ta: 'எம்.எஸ்சி', en: 'M.Sc' },
  'பி.காம்': { ta: 'பி.காம்', en: 'B.Com' },
  'B.Com': { ta: 'பி.காம்', en: 'B.Com' },
  'BCom': { ta: 'பி.காம்', en: 'B.Com' },
  'பி.ஏ': { ta: 'பி.ஏ', en: 'B.A' },
  'B.A': { ta: 'பி.ஏ', en: 'B.A' },
  'BA': { ta: 'பி.ஏ', en: 'B.A' },
  'எம்.ஏ': { ta: 'எம்.ஏ', en: 'M.A' },
  'M.A': { ta: 'எம்.ஏ', en: 'M.A' },
  'MA': { ta: 'எம்.ஏ', en: 'M.A' },
  'MBBS': { ta: 'எம்.பி.பி.எஸ் (மருத்துவம்)', en: 'MBBS (Medical)' },
  'எம்.பி.பி.எஸ்': { ta: 'எம்.பி.பி.எஸ் (மருத்துவம்)', en: 'MBBS (Medical)' },
  'MD': { ta: 'எம்.டி (MD)', en: 'MD' },
  'MS': { ta: 'எம்.எஸ் (MS)', en: 'MS' },
  'BDS': { ta: 'பி.டி.எஸ் (BDS)', en: 'BDS' },
  'B.Pharm': { ta: 'பார்மசி (B.Pharm)', en: 'B.Pharm' },
  'Law': { ta: 'சட்டம் (BL / LLB)', en: 'Law (BL / LLB)' },
  'BL': { ta: 'சட்டம் (BL / LLB)', en: 'BL' },
  'LLB': { ta: 'சட்டம் (BL / LLB)', en: 'LLB' },
  'CA': { ta: 'சார்ட்டர்ட் அக்கவுண்டண்ட் (CA)', en: 'Chartered Accountant (CA)' },
  'Ph.D': { ta: 'முனைவர் பட்டம் (Ph.D)', en: 'Ph.D' },
  'Alim': { ta: 'ஆலிம் (Alim)', en: 'Alim' },
  'ஆலிம்': { ta: 'ஆலிம் (Alim)', en: 'Alim' },
  'Aalima': { ta: 'ஆலிமா (Aalima)', en: 'Aalima' },
  'ஆலிமா': { ta: 'ஆலிமா (Aalima)', en: 'Aalima' },
  'Hafiz': { ta: 'ஹாஃபிழ் (Hafiz)', en: 'Hafiz' },
  'ஹாஃபிழ்': { ta: 'ஹாஃபிழ் (Hafiz)', en: 'Hafiz' },

  // Professions / Careers
  'சாப்ட்வேர் இன்ஜினியர்': { ta: 'மென்பொருள் பொறியாளர்', en: 'Software Engineer' },
  'Software Engineer': { ta: 'மென்பொருள் பொறியாளர்', en: 'Software Engineer' },
  'சாப்ட்வேர் டெவலப்பர்': { ta: 'மென்பொருள் டெவலப்பர்', en: 'Software Developer' },
  'Software Developer': { ta: 'மென்பொருள் டெவலப்பர்', en: 'Software Developer' },
  'Software': { ta: 'மென்பொருள் துறை', en: 'Software' },
  'IT': { ta: 'தகவல் தொழில்நுட்பம் (IT)', en: 'IT Professional' },
  'IT Professional': { ta: 'தகவல் தொழில்நுட்பம் (IT)', en: 'IT Professional' },
  'Web Developer': { ta: 'வலைத்தள டெவலப்பர்', en: 'Web Developer' },
  'குவாலிட்டி மேனேஜர்': { ta: 'குவாலிட்டி மேனேஜர்', en: 'Quality Manager' },
  'Quality Manager': { ta: 'குவாலிட்டி மேனேஜர்', en: 'Quality Manager' },
  'டேட்டா அனலிஸ்ட்': { ta: 'டேட்டா அனலிஸ்ட்', en: 'Data Analyst' },
  'Data Analyst': { ta: 'டேட்டா அனலிஸ்ட்', en: 'Data Analyst' },
  'வங்கிப் பணியாளர்': { ta: 'வங்கிப் பணியாளர்', en: 'Bank Employee' },
  'Bank Employee': { ta: 'வங்கிப் பணியாளர்', en: 'Bank Employee' },
  'Banker': { ta: 'வங்கிப் பணியாளர்', en: 'Bank Employee' },
  'சொந்த தொழில் (ஹார்டுவேர்)': { ta: 'சொந்த தொழில் (ஹார்டுவேர்)', en: 'Own Business (Hardware)' },
  'சொந்த தொழில்': { ta: 'சொந்த தொழில்', en: 'Own Business' },
  'Own Business': { ta: 'சொந்த தொழில்', en: 'Own Business' },
  'Business': { ta: 'சொந்த தொழில் / வணிகம்', en: 'Business' },
  'Business / Govt': { ta: 'வணிகம் / அரசுப் பணி', en: 'Business / Govt' },
  'Businessman': { ta: 'தொழிலதிபர்', en: 'Businessman' },
  'Self Employed': { ta: 'சுய தொழில்', en: 'Self Employed' },
  'சுய தொழில்': { ta: 'சுய தொழில்', en: 'Self Employed' },
  'ஆசிரியர்': { ta: 'ஆசிரியர்', en: 'Teacher' },
  'Teacher': { ta: 'ஆசிரியர்', en: 'Teacher' },
  'பள்ளி ஆசிரியை': { ta: 'ஆசிரியர்', en: 'School Teacher' },
  'School Teacher': { ta: 'ஆசிரியர்', en: 'School Teacher' },
  'Professor': { ta: 'பேராசிரியர்', en: 'Professor' },
  'பேராசிரியர்': { ta: 'பேராசிரியர்', en: 'Professor' },
  'Lecturer': { ta: 'விரிவுரையாளர்', en: 'Lecturer' },
  'ஸ்டாஃப் நர்ஸ்': { ta: 'ஸ்டாஃப் நர்ஸ்', en: 'Staff Nurse' },
  'Staff Nurse': { ta: 'ஸ்டாஃப் நர்ஸ்', en: 'Staff Nurse' },
  'செவிலியர்': { ta: 'செவிலியர்', en: 'Nurse' },
  'Nurse': { ta: 'செவிலியர்', en: 'Nurse' },
  'மருத்துவர்': { ta: 'மருத்துவர்', en: 'Doctor' },
  'Doctor': { ta: 'மருத்துவர்', en: 'Doctor' },
  'டாக்டர்': { ta: 'மருத்துவர்', en: 'Doctor' },
  'Dentist': { ta: 'பல் மருத்துவர்', en: 'Dentist' },
  'பல் மருத்துவர்': { ta: 'பல் மருத்துவர்', en: 'Dentist' },
  'Engineer': { ta: 'பொறியாளர்', en: 'Engineer' },
  'பொறியாளர்': { ta: 'பொறியாளர்', en: 'Engineer' },
  'Civil Engineer': { ta: 'சிவில் பொறியாளர்', en: 'Civil Engineer' },
  'Mechanical Engineer': { ta: 'மெக்கானிக்கல் பொறியாளர்', en: 'Mechanical Engineer' },
  'Electrical Engineer': { ta: 'எலக்ட்ரிக்கல் பொறியாளர்', en: 'Electrical Engineer' },
  'மார்க்கெட்டிங் மேனேஜர்': { ta: 'மார்க்கெட்டிங் மேனேஜர்', en: 'Marketing Manager' },
  'Marketing Manager': { ta: 'மார்க்கெட்டிங் மேனேஜர்', en: 'Marketing Manager' },
  'மீன்பிடி ஏற்றுமதி தொழில்': { ta: 'மீன்பிடி ஏற்றுமதி தொழில்', en: 'Fisheries Export Business' },
  'Fisheries Export Business': { ta: 'மீன்பிடி ஏற்றுமதி தொழில்', en: 'Fisheries Export Business' },
  'கெமிஸ்ட்': { ta: 'வேதியியலாளர்', en: 'Chemist' },
  'Chemist': { ta: 'வேதியியலாளர்', en: 'Chemist' },
  'Pharmacist': { ta: 'மருந்தாளுநர்', en: 'Pharmacist' },
  'அக்கவுண்டண்ட்': { ta: 'கணக்காளர்', en: 'Accountant' },
  'Accountant': { ta: 'கணக்காளர்', en: 'Accountant' },
  'கணக்காளர்': { ta: 'கணக்காளர்', en: 'Accountant' },
  'Auditor': { ta: 'தணிக்கையாளர்', en: 'Auditor' },
  'Manager': { ta: 'மேலாளர்', en: 'Manager' },
  'மேலாளர்': { ta: 'மேலாளர்', en: 'Manager' },
  'Sales': { ta: 'விற்பனைப் பிரிவு', en: 'Sales' },
  'Sales Executive': { ta: 'விற்பனை நிர்வாகி', en: 'Sales Executive' },
  'HR Manager': { ta: 'மனிதவள மேலாளர் (HR)', en: 'HR Manager' },
  'HR': { ta: 'மனிதவள மேலாளர் (HR)', en: 'HR' },
  'Technician': { ta: 'தொழில்நுட்ப வல்லுநர்', en: 'Technician' },
  'சிஎன்சி மெஷினிஸ்ட்': { ta: 'சிஎன்சி மெஷினிஸ்ட்', en: 'CNC Machinist' },
  'CNC Machinist': { ta: 'சிஎன்சி மெஷினிஸ்ட்', en: 'CNC Machinist' },
  'தனியார் பணி': { ta: 'தனியார் பணி', en: 'Private Employee' },
  'Private Employee': { ta: 'தனியார் பணி', en: 'Private Employee' },
  'Private Job': { ta: 'தனியார் பணி', en: 'Private Job' },
  'Private': { ta: 'தனியார் பணி', en: 'Private' },
  'அரசுப் பணி': { ta: 'அரசுப் பணி', en: 'Govt Employee' },
  'Govt Employee': { ta: 'அரசுப் பணி', en: 'Govt Employee' },
  'Govt Job': { ta: 'அரசுப் பணி', en: 'Govt Job' },
  'Government': { ta: 'அரசுப் பணி', en: 'Govt Employee' },
  'Government Job': { ta: 'அரசுப் பணி', en: 'Government Job' },
  'Electrician': { ta: 'எலக்ட்ரீஷியன்', en: 'Electrician' },
  'எலக்ட்ரீஷியன்': { ta: 'எலக்ட்ரீஷியன்', en: 'Electrician' },
  'Plumber': { ta: 'பிளம்பர்', en: 'Plumber' },
  'பிளம்பர்': { ta: 'பிளம்பர்', en: 'Plumber' },
  'Driver': { ta: 'ஓட்டுநர்', en: 'Driver' },
  'ஓட்டுநர்': { ta: 'ஓட்டுநர்', en: 'Driver' },
  'Chef': { ta: 'சமையல் கலைஞர்', en: 'Chef' },
  'Cook': { ta: 'சமையல் கலைஞர்', en: 'Cook' },
  'பிரியாணி மாஸ்டர்': { ta: 'பிரியாணி மாஸ்டர்', en: 'Biryani Chef / Master' },
  'Biryani Master': { ta: 'பிரியாணி மாஸ்டர்', en: 'Biryani Master' },
  'Biryani Chef / Master': { ta: 'பிரியாணி மாஸ்டர்', en: 'Biryani Chef / Master' },
  'ஏர் டிராவல்ஸ் -வொர்க்கர்': { ta: 'ஏர் டிராவல்ஸ் பணி', en: 'Air Travels Staff' },
  'Air Travels Staff': { ta: 'ஏர் டிராவல்ஸ் பணி', en: 'Air Travels Staff' },
  'Shop Owner': { ta: 'கடை உரிமையாளர்', en: 'Shop Owner' },
  'Merchant': { ta: 'வியாபாரி', en: 'Merchant' },
  'Trader': { ta: 'வியாபாரி', en: 'Trader' },
  'வியாபாரி': { ta: 'வியாபாரி', en: 'Merchant' },
  'Tailor': { ta: 'தையல் கலைஞர்', en: 'Tailor' },
  'தையல் கலைஞர்': { ta: 'தையல் கலைஞர்', en: 'Tailor' },
  'Graphic Designer': { ta: 'கிராஃபிக் டிசைனர்', en: 'Graphic Designer' },
  'Real Estate': { ta: 'ரியல் எஸ்டேட்', en: 'Real Estate' },
  'Agriculture': { ta: 'விவசாயம்', en: 'Agriculture' },
  'Farmer': { ta: 'விவசாயி', en: 'Farmer' },
  'விவசாயம்': { ta: 'விவசாயம்', en: 'Agriculture' },
  'Student': { ta: 'மாணவர்', en: 'Student' },
  'மாணவர்': { ta: 'மாணவர்', en: 'Student' },
  'Homemaker': { ta: 'இல்லத்தரசி', en: 'Homemaker' },
  'Housewife': { ta: 'இல்லத்தரசி', en: 'Housewife' },
  'இல்லத்தரசி': { ta: 'இல்லத்தரசி', en: 'Homemaker' },
  'Seeking Job': { ta: 'வேலை தேடுகிறார்', en: 'Seeking Job' },
  'Looking for Job': { ta: 'வேலை தேடுகிறார்', en: 'Looking for Job' },
  'வேலை தேடுகிறார்': { ta: 'வேலை தேடுகிறார்', en: 'Seeking Job' },

  // Property
  'சொந்த வீடு': { ta: 'சொந்த வீடு', en: 'Own House' },
  'Own House': { ta: 'சொந்த வீடு', en: 'Own House' },
  'Own house': { ta: 'சொந்த வீடு', en: 'Own House' },
  '1 வீடு': { ta: '1 வீடு', en: '1 House' },
  '1 House': { ta: '1 வீடு', en: '1 House' },
  '2 வீடு': { ta: '2 வீடு', en: '2 Houses' },
  '2 வீடுகள்': { ta: '2 வீடுகள்', en: '2 Houses' },
  '2 Houses': { ta: '2 வீடுகள்', en: '2 Houses' },
  '3 Houses': { ta: '3 வீடுகள்', en: '3 Houses' },
  'சொந்த அடுக்குமாடி குடியிருப்பு': { ta: 'சொந்த அடுக்குமாடி குடியிருப்பு', en: 'Own Apartment' },
  'Own Apartment': { ta: 'சொந்த அடுக்குமாடி குடியிருப்பு', en: 'Own Apartment' },
  'சொந்த வீடு மற்றும் நிலம்': { ta: 'சொந்த வீடு மற்றும் நிலம்', en: 'Own House and Land' },
  'Own House and Land': { ta: 'சொந்த வீடு மற்றும் நிலம்', en: 'Own House and Land' },
  'Own House & Land': { ta: 'சொந்த வீடு மற்றும் நிலம்', en: 'Own House and Land' },
  'சொந்த பங்களா வீடு': { ta: 'சொந்த பங்களா வீடு', en: 'Own Bungalow' },
  'Own Bungalow': { ta: 'சொந்த பங்களா வீடு', en: 'Own Bungalow' },
  'Own Land': { ta: 'சொந்த நிலம்', en: 'Own Land' },
  'சொந்த நிலம்': { ta: 'சொந்த நிலம்', en: 'Own Land' },
  'Rented House': { ta: 'வாடகை வீடு', en: 'Rented House' },
  'வாடகை வீடு': { ta: 'வாடகை வீடு', en: 'Rented House' },
  'அடுக்குமாடி குடியிருப்பு': { ta: 'அடுக்குமாடி குடியிருப்பு', en: 'Apartment / Flat' },
  'Apartment / Flat': { ta: 'அடுக்குமாடி குடியிருப்பு', en: 'Apartment / Flat' },
  'Apartment': { ta: 'அடுக்குமாடி குடியிருப்பு', en: 'Apartment' },
  'Flat': { ta: 'அடுக்குமாடி குடியிருப்பு', en: 'Flat' },
  'Land': { ta: 'நிலம் / மனை', en: 'Land' },
  'நிலம்': { ta: 'நிலம் / மனை', en: 'Land' },
  'மனை': { ta: 'மனை', en: 'Plot' },
  'Plot': { ta: 'மனை', en: 'Plot' },
  'Plots': { ta: 'மனைகள்', en: 'Plots' },
  'மனைகள்': { ta: 'மனைகள்', en: 'Plots' },
  'Land, Commercial plot': { ta: 'நிலம், வணிக மனை', en: 'Land, Commercial plot' },
  'Commercial Land': { ta: 'வணிக மனை', en: 'Commercial Land' },
  'Agricultural Land': { ta: 'நன்செய் நிலம்', en: 'Agricultural Land' },
  'நன்செய் நிலம்': { ta: 'நன்செய் நிலம்', en: 'Agricultural Land' },
  'தோட்டம் & வீடு': { ta: 'தோட்டம் & வீடு', en: 'Garden & House' },
  'Garden & House': { ta: 'தோட்டம் & வீடு', en: 'Garden & House' },
  'இல்லை': { ta: 'இல்லை', en: 'None' },
  'None': { ta: 'இல்லை', en: 'None' },
  'Nil': { ta: 'இல்லை', en: 'None' },
  'No': { ta: 'இல்லை', en: 'No' },

  // Degrees with Specializations
  'B.E (Computer Science)': { ta: 'பி.இ (கணினி அறிவியல்)', en: 'B.E (Computer Science)' },
  'B.E. (Computer Science)': { ta: 'பி.இ (கணினி அறிவியல்)', en: 'B.E (Computer Science)' },
  'B.E (Mechanical)': { ta: 'பி.இ (மெக்கானிக்கல்)', en: 'B.E (Mechanical)' },
  'B.E. (Mechanical)': { ta: 'பி.இ (மெக்கானிக்கல்)', en: 'B.E (Mechanical)' },
  'B.E (Civil)': { ta: 'பி.இ (சிவில்)', en: 'B.E (Civil)' },
  'B.E (ECE)': { ta: 'பி.இ (இசிஇ)', en: 'B.E (ECE)' },
  'B.E (EEE)': { ta: 'பி.இ (இஇஇ)', en: 'B.E (EEE)' },
  'B.Tech IT': { ta: 'பி.டெக் (IT)', en: 'B.Tech IT' },
  'B.Tech (IT)': { ta: 'பி.டெக் (IT)', en: 'B.Tech (IT)' },
  'M.Sc (Biochemistry)': { ta: 'எம்.எஸ்சி (உயிர்வேதியியல்)', en: 'M.Sc (Biochemistry)' },
  'M.Sc (Maths)': { ta: 'எம்.எஸ்சி (கணிதம்)', en: 'M.Sc (Maths)' },
  'M.Sc (Computer Science)': { ta: 'எம்.எஸ்சி (கணினி அறிவியல்)', en: 'M.Sc (Computer Science)' },
  'B.Sc (Maths)': { ta: 'பி.எஸ்சி (கணிதம்)', en: 'B.Sc (Maths)' },
  'B.Sc. (Maths)': { ta: 'பி.எஸ்சி (கணிதம்)', en: 'B.Sc (Maths)' },
  'B.Sc (Physics)': { ta: 'பி.எஸ்சி (இயற்பியல்)', en: 'B.Sc (Physics)' },
  'B.Sc (Chemistry)': { ta: 'பி.எஸ்சி (வேதியியல்)', en: 'B.Sc (Chemistry)' },
  'B.Sc (Computer Science)': { ta: 'பி.எஸ்சி (கணினி அறிவியல்)', en: 'B.Sc (Computer Science)' },
  'MBA (Finance)': { ta: 'எம்.பி.ஏ (நிதி மேலாண்மை)', en: 'MBA (Finance)' },
  'MBA (HR)': { ta: 'எம்.பி.ஏ (மனிதவளம் - HR)', en: 'MBA (HR)' },
  'MBA (Marketing)': { ta: 'எம்.பி.ஏ (சந்தைப்படுத்தல்)', en: 'MBA (Marketing)' },
  'B.Com (CA)': { ta: 'பி.காம் (சி.ஏ)', en: 'B.Com (CA)' },
  'B.Com (General)': { ta: 'பி.காம் (பொது)', en: 'B.Com (General)' },
  'Diploma in Civil': { ta: 'டிப்ளமோ (சிவில்)', en: 'Diploma in Civil' },
  'Diploma in Mechanical': { ta: 'டிப்ளமோ (மெக்கானிக்கல்)', en: 'Diploma in Mechanical' },
  'Diploma in Electrical': { ta: 'டிப்ளமோ (எலக்ட்ரிக்கல்)', en: 'Diploma in Electrical' },
  'Higher Secondary (+2)': { ta: '+2 (மேல்நிலை)', en: '+2 (Higher Secondary)' },
  'Higher Secondary': { ta: '+2 (மேல்நிலை)', en: '+2 (Higher Secondary)' },
  'Secondary (10th)': { ta: '10-ஆம் வகுப்பு (SSLC)', en: '10th Standard (SSLC)' },
  'Pharm.D': { ta: 'பார்ம்.டி (மருந்தியல்)', en: 'Pharm.D' },
  'Computer Science': { ta: 'கணினி அறிவியல்', en: 'Computer Science' },
  'Biochemistry': { ta: 'உயிர்வேதியியல்', en: 'Biochemistry' },
  'Finance': { ta: 'நிதி மேலாண்மை (Finance)', en: 'Finance' },
  'Marketing': { ta: 'சந்தைப்படுத்தல்', en: 'Marketing' },
  'Mechanical': { ta: 'மெக்கானிக்கல்', en: 'Mechanical' },
  'Civil': { ta: 'சிவில்', en: 'Civil' },
  'Maths': { ta: 'கணிதம்', en: 'Maths' },
  'Mathematics': { ta: 'கணிதம்', en: 'Mathematics' },

  // Occupations & Job Titles
  'Technical Lead': { ta: 'தொழில்நுட்ப தலைமை (Technical Lead)', en: 'Technical Lead' },
  'Team Lead': { ta: 'குழு தலைமை (Team Lead)', en: 'Team Lead' },
  'Project Manager': { ta: 'திட்ட மேலாளர் (Project Manager)', en: 'Project Manager' },
  'Bank Manager': { ta: 'வங்கி மேலாளர்', en: 'Bank Manager' },
  'வங்கி மேலாளர் (Bank Manager)': { ta: 'வங்கி மேலாளர்', en: 'Bank Manager' },
  'Office Administrator': { ta: 'அலுவலக நிர்வாகி', en: 'Office Administrator' },
  'அலுவலக நிர்வாகி': { ta: 'அலுவலக நிர்வாகி', en: 'Office Administrator' },
  'Teacher / Lecturer': { ta: 'ஆசிரியர் / விரிவுரையாளர்', en: 'Teacher / Lecturer' },
  'ஆசிரியர் / விரிவுரையாளர்': { ta: 'ஆசிரியர் / விரிவுரையாளர்', en: 'Teacher / Lecturer' },
  'Wholesale Grocery Merchant': { ta: 'மொத்த மளிகை வியாபாரி', en: 'Wholesale Grocery Merchant' },
  'Wholesale Merchant': { ta: 'மொத்த வியாபாரி', en: 'Wholesale Merchant' },
  'Senior Software Engineer': { ta: 'முதுநிலை மென்பொருள் பொறியாளர்', en: 'Senior Software Engineer' },
  'Full Stack Developer': { ta: 'முழு அடுக்கு டெவலப்பர் (Full Stack)', en: 'Full Stack Developer' },
  'Frontend Developer': { ta: 'முன்பக்க டெவலப்பர் (Frontend)', en: 'Frontend Developer' },
  'Backend Developer': { ta: 'பின்பக்க டெவலப்பர் (Backend)', en: 'Backend Developer' },
  'UI/UX Designer': { ta: 'UI/UX வடிவமைப்பாளர்', en: 'UI/UX Designer' },
  'System Administrator': { ta: 'கணினி நிர்வாகி', en: 'System Administrator' },
  'Network Engineer': { ta: 'நெட்வொர்க் பொறியாளர்', en: 'Network Engineer' },
  'Database Administrator': { ta: 'தரவுத்தள நிர்வாகி (DBA)', en: 'Database Administrator' },
  'DevOps Engineer': { ta: 'டெவொப்ஸ் பொறியாளர் (DevOps)', en: 'DevOps Engineer' },
  'Financial Analyst': { ta: 'நிதி ஆய்வாளர்', en: 'Financial Analyst' },
  'Dental Surgeon': { ta: 'பல் மருத்துவர் (Dental Surgeon)', en: 'Dental Surgeon' },
  'Medical Store': { ta: 'மருந்தகம் (Medical Store)', en: 'Medical Store' },
  'Medical Store Owner': { ta: 'மருந்தக உரிமையாளர் (Medical Store)', en: 'Medical Store Owner' },
  'மருந்தக உரிமையாளர் (Medical Store)': { ta: 'மருந்தக உரிமையாளர் (Medical Store)', en: 'Medical Store Owner' },
  'Seafood Export Business': { ta: 'கடல் உணவு ஏற்றுமதி வணிகம்', en: 'Seafood Export Business' },
  'Marine Biology': { ta: 'கடல் உயிரியல்', en: 'Marine Biology' },
  'B.Sc Marine Biology': { ta: 'பி.எஸ்சி (கடல் உயிரியல்)', en: 'B.Sc Marine Biology' },
  'Matriculation School': { ta: 'மெட்ரிக் பள்ளி', en: 'Matriculation School' },
  'Metric School': { ta: 'மெட்ரிக் பள்ளி', en: 'Metric School' },
  'Private Bank': { ta: 'தனியார் வங்கி', en: 'Private Bank' },
  'Private Hospital': { ta: 'தனியார் மருத்துவமனை', en: 'Private Hospital' },
  'T.Nagar': { ta: 'தி.நகர்', en: 'T.Nagar' },
  'T.Nagar, Chennai': { ta: 'தி.நகர், சென்னை', en: 'T.Nagar, Chennai' },
  'T. Nagar, Chennai': { ta: 'தி.நகர், சென்னை', en: 'T. Nagar, Chennai' },
  'தி.நகர், சென்னை': { ta: 'தி.நகர், சென்னை', en: 'T.Nagar, Chennai' },
  'தி.நகர்': { ta: 'தி.நகர்', en: 'T. Nagar' },
  'Properties in Salem and Chennai': { ta: 'சேலம் மற்றும் சென்னையில் சொத்துக்கள்', en: 'Properties in Salem and Chennai' },
  'Assets in Salem and Chennai': { ta: 'சேலம் மற்றும் சென்னையில் சொத்துக்கள்', en: 'Assets in Salem and Chennai' },
  'சேலம் மற்றும் சென்னையில் சொத்துக்கள்': { ta: 'சேலம் மற்றும் சென்னையில் சொத்துக்கள்', en: 'Properties in Salem and Chennai' },
  'Own House and Clinic': { ta: 'சொந்த வீடு மற்றும் கிளினிக்', en: 'Own House and Clinic' },
  'சொந்த வீடு மற்றும் கிளினிக்': { ta: 'சொந்த வீடு மற்றும் கிளினிக்', en: 'Own House and Clinic' },
  'B.Com, MBA': { ta: 'பி.காம், எம்.பி.ஏ', en: 'B.Com, MBA' },
  'M.Com, B.Ed': { ta: 'எம்.காம், பி.எட்', en: 'M.Com, B.Ed' },
  'UAE Resident': { ta: 'அமீரக வாழ் தமிழர் (UAE Resident)', en: 'UAE Resident' },
  'Indian Citizen': { ta: 'இந்திய குடிமகன் (Indian Citizen)', en: 'Indian Citizen' },
  'will_work': { ta: 'வேலைக்கு செல்வார்', en: 'Will Work' },
  'homemaker': { ta: 'வேலைக்கு செல்ல மாட்டார் / இல்லத்தரசி', en: 'Will Not Work / Homemaker' },
  'permission': { ta: 'அனுமதி தந்தால் வேலைக்கு செல்வார்', en: 'Will Work if Permission is Given' },
  'working_bride': { ta: 'வேலை பார்க்கும் மணமகள் தேவை', en: 'Looking for a Working Bride' },
  'homemaker_bride': { ta: 'இல்லத்தரசி மணமகள் தேவை', en: 'Looking for a Homemaker' },
  'no_preference': { ta: 'விருப்பம் / நிபந்தனை இல்லை', en: 'No Preference' },
  'Educated, religious bride required.': { ta: 'படித்த, மார்க்க பற்றுள்ள பெண் தேவை.', en: 'Educated, religious bride required.' },
  'Educated, religious bride required': { ta: 'படித்த, மார்க்க பற்றுள்ள பெண் தேவை.', en: 'Educated, religious bride required.' },
  'Looking for a suitable groom.': { ta: 'நல்ல குணமுள்ள மார்க்க பற்றுள்ள மணமகன் தேவை.', en: 'Looking for a suitable groom.' },
  'Looking for a suitable groom': { ta: 'நல்ல குணமுள்ள மார்க்க பற்றுள்ள மணமகன் தேவை.', en: 'Looking for a suitable groom.' },
  'Well settled groom required.': { ta: 'நல்ல உத்தியோகத்தில் உள்ள மணமகன் தேவை.', en: 'Well settled groom required.' },
  'Well settled groom required': { ta: 'நல்ல உத்தியோகத்தில் உள்ள மணமகன் தேவை.', en: 'Well settled groom required.' },
  'Family oriented bride expected.': { ta: 'குடும்பப் பாங்கான மணமகள் தேவை.', en: 'Family oriented bride expected.' },
  'Family oriented bride expected': { ta: 'குடும்பப் பாங்கான மணமகள் தேவை.', en: 'Family oriented bride expected.' },
  'Religious and educated partner expected.': { ta: 'மார்க்கப்பற்றுள்ள, படித்த துணை தேவை.', en: 'Religious and educated partner expected.' },
  'Religious and educated partner expected': { ta: 'மார்க்கப்பற்றுள்ள, படித்த துணை தேவை.', en: 'Religious and educated partner expected.' },
  'Tamil Nadu': { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' },
  'தமிழ்நாடு': { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' },
  'Not provided': { ta: 'வழங்கப்படவில்லை', en: 'Not provided' },
  'வழங்கப்படவில்லை': { ta: 'வழங்கப்படவில்லை', en: 'Not provided' },

  // Workplaces / Localities
  'MNC, Guindy, Chennai': { ta: 'எம்.என்.சி, கிண்டி, சென்னை', en: 'MNC, Guindy, Chennai' },
  'MNC': { ta: 'பன்னாட்டு நிறுவனம் (MNC)', en: 'MNC' },
  'Guindy': { ta: 'கிண்டி', en: 'Guindy' },
  'கிண்டி': { ta: 'கிண்டி', en: 'Guindy' },
  'Cognizant Technology Solutions, Chennai': { ta: 'காக்னிசன்ட் டெக்னாலஜி சொல்யூஷன்ஸ், சென்னை', en: 'Cognizant Technology Solutions, Chennai' },
  'Cognizant': { ta: 'காக்னிசன்ட்', en: 'Cognizant' },
  'Al-Madina Air Travels, Parry\'s Corner, Chennai': { ta: 'அல்-மதீனா ஏர் டிராவல்ஸ், பாரிமுனை, சென்னை', en: 'Al-Madina Air Travels, Parry\'s Corner, Chennai' },
  'Parry\'s Corner': { ta: 'பாரிமுனை', en: 'Parry\'s Corner' },
  'Nawab Catering & Biryani, Royapettah, Chennai': { ta: 'நவாப் கேடரிங் & பிரியாணி சென்டர், இராயப்பேட்டை, சென்னை', en: 'Nawab Catering & Biryani, Royapettah, Chennai' },
  'Royapettah': { ta: 'இராயப்பேட்டை', en: 'Royapettah' },
  'Anna Nagar': { ta: 'அண்ணா நகர்', en: 'Anna Nagar' },
  'அண்ணா நகர்': { ta: 'அண்ணா நகர்', en: 'Anna Nagar' },
  'KK Nagar': { ta: 'கே.கே நகர்', en: 'KK Nagar' },
  'RS Puram': { ta: 'ஆர்.எஸ்.புரம்', en: 'RS Puram' },
  'T. Nagar': { ta: 'தி.நகர்', en: 'T. Nagar' },
  'Velachery': { ta: 'வேளச்சேரி', en: 'Velachery' },
  'Tambaram': { ta: 'தாம்பரம்', en: 'Tambaram' },

  // Common Requirements & Expectations
  'Family-oriented, well-mannered, religious bride expected.': { ta: 'குடும்பப் பாங்கான, நற்குணமுள்ள, மார்க்க பற்றுள்ள பெண் தேவை.', en: 'Family-oriented, well-mannered, religious bride expected.' },
  'Divorced or remarriage profiles welcome.': { ta: 'மறுமணம் அல்லது விவாகரத்து ஆன பெண்களும் சம்மதம்.', en: 'Divorced or remarriage profiles welcome.' },
  'Educated graduate, virtuous, Hijab-practicing bride preferred.': { ta: 'பட்டதாரி, நற்குணமுள்ள, பர்தா அணியும் பெண் தேவை.', en: 'Educated graduate, virtuous, Hijab-practicing bride preferred.' },
  'Suitable Bride required': { ta: 'தகுந்த பெண் தேவை.', en: 'Suitable Bride required.' },
  'Suitable Groom required': { ta: 'தகுந்த ஆண் தேவை.', en: 'Suitable Groom required.' },
  'Suitable match required.': { ta: 'பொருத்தமான வரன் தேவை.', en: 'Suitable match required.' },
  'Suitable match required': { ta: 'பொருத்தமான வரன் தேவை.', en: 'Suitable match required.' },
  'தகுந்த பெண் தேவை.': { ta: 'தகுந்த பெண் தேவை.', en: 'Suitable Bride required.' },
  'Suitable Bride required.': { ta: 'தகுந்த பெண் தேவை.', en: 'Suitable Bride required.' },
  'Suitable Bride Required': { ta: 'தகுந்த பெண் தேவை.', en: 'Suitable Bride required.' },
  'தகுந்த ஆண் தேவை.': { ta: 'தகுந்த ஆண் தேவை.', en: 'Suitable Groom required.' },
  'Suitable Groom required.': { ta: 'தகுந்த ஆண் தேவை.', en: 'Suitable Groom required.' },
  'Suitable Groom Required': { ta: 'தகுந்த ஆண் தேவை.', en: 'Suitable Groom required.' },
  'குடும்பப் பாங்கு': { ta: 'குடும்பப் பாங்கு', en: 'Family-oriented' },
  'Family-oriented': { ta: 'குடும்பப் பாங்கு', en: 'Family-oriented' },

  // Distance / Radius
  'தேர்வு செய்க': { ta: 'தேர்வு செய்க', en: 'Select' },
  'Select': { ta: 'தேர்வு செய்க', en: 'Select' },
  '25 கி.மீ': { ta: '25 கி.மீ', en: '25 km' },
  '25 km': { ta: '25 கி.மீ', en: '25 km' },
  '50 கி.மீ': { ta: '50 கி.மீ', en: '50 km' },
  '50 km': { ta: '50 கி.மீ', en: '50 km' },
  '100 கி.மீ': { ta: '100 கி.மீ', en: '100 km' },
  '100 km': { ta: '100 கி.மீ', en: '100 km' },
  '150 கி.மீ': { ta: '150 கி.மீ', en: '150 km' },
  '150 km': { ta: '150 கி.மீ', en: '150 km' },
  '200 கி.மீ': { ta: '200 கி.மீ', en: '200 km' },
  '200 km': { ta: '200 கி.மீ', en: '200 km' },
  'அனைத்து தூரமும்': { ta: 'அனைத்து தூரமும்', en: 'All Distances' },
  'All Distances': { ta: 'அனைத்து தூரமும்', en: 'All Distances' },
  'அனைத்தும்': { ta: 'அனைத்தும்', en: 'All' },
  'All': { ta: 'அனைத்தும்', en: 'All' },
};

// Fast normalized case-insensitive bidirectional lookup map
const normalizedDictionary = new Map();

function registerNormalized(term, ta, en) {
  if (!term || typeof term !== 'string') return;
  const key = term.trim().toLowerCase();
  if (key && !normalizedDictionary.has(key)) {
    normalizedDictionary.set(key, { ta, en });
  }
}

// Populate dictionary with all primary keys and their target translations
Object.entries(profileValueTranslations).forEach(([key, val]) => {
  if (val && val.ta && val.en) {
    registerNormalized(key, val.ta, val.en);
    registerNormalized(val.ta, val.ta, val.en);
    registerNormalized(val.en, val.ta, val.en);
  }
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('nikah_lang') || 'ta';
    } catch {
      return 'ta';
    }
  });

  const setLanguage = (newLang) => {
    const langKey = newLang === 'en' || newLang === 'English' ? 'en' : 'ta';
    setLanguageState(langKey);
    try {
      localStorage.setItem('nikah_lang', langKey);
      document.documentElement.lang = langKey;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const langSet = translations[language] || translations.ta;
    return langSet[key] ?? translations.ta[key] ?? key;
  };

  /**
   * Smart bidirectional translation for matrimonial fields (Tamil <-> English).
   * Note: NEVER translates personal proper names (e.g., name "Raja" stays "Raja", NOT translated to "King").
   */
  const translateValue = (val) => {
    if (val === null || val === undefined) return '';
    const targetLang = language === 'en' ? 'en' : 'ta';

    if (typeof val === 'number') {
      return `₹${val.toLocaleString('en-IN')} ${targetLang === 'en' ? '/ month' : '/ மாதம்'}`;
    }

    if (typeof val !== 'string') return String(val);
    const trimmed = val.trim();
    if (!trimmed) return trimmed;

    // 1. Direct case-insensitive lookup
    const lowerKey = trimmed.toLowerCase();
    if (normalizedDictionary.has(lowerKey)) {
      return normalizedDictionary.get(lowerKey)[targetLang] || trimmed;
    }

    // 2. Direct exact lookup in profileValueTranslations
    if (profileValueTranslations[trimmed]) {
      return profileValueTranslations[trimmed][targetLang] || trimmed;
    }

    // 3. Height conversions (e.g. "5.6 அடி (5'6")" <-> "5.6 ft (5'6")")
    if (targetLang === 'en') {
      if (trimmed.includes('அடி')) {
        return trimmed.replace(/அடி/g, 'ft');
      }
    } else {
      if (/\bft\b|\bfeet\b/i.test(trimmed)) {
        return trimmed.replace(/\bfeet\b/gi, 'அடி').replace(/\bft\b/gi, 'அடி');
      }
    }

    // 4. Income conversions (e.g. "₹50,000 / month" <-> "₹50,000 / மாதம்", "40,000/" -> "40,000 / மாதம்")
    if (targetLang === 'en') {
      if (trimmed.includes('/ மாதம்') || trimmed.includes('மாதம்')) {
        return trimmed.replace(/\/ மாதம்/g, ' / month').replace(/மாதம்/g, 'month');
      }
      if (trimmed.endsWith('/')) {
        return trimmed.replace(/\/$/, ' / month');
      }
    } else {
      if (trimmed.endsWith('/')) {
        return trimmed.replace(/\/$/, ' / மாதம்');
      }
      if (/\/ month/i.test(trimmed) || /\bper month\b/i.test(trimmed) || /\/mo\b/i.test(trimmed) || /\/pm\b/i.test(trimmed)) {
        return trimmed
          .replace(/\/\s*month/gi, ' / மாதம்')
          .replace(/\bper\s+month\b/gi, ' / மாதம்')
          .replace(/\/\s*mo\b/gi, ' / மாதம்')
          .replace(/\/\s*pm\b/gi, ' / மாதம்');
      }
    }

    // 5. Handle compound values separated by slashes (e.g. "Software Engineer / Business", "B.E / MBA", "Chennai / Dubai")
    if (trimmed.includes('/') && !trimmed.match(/\d+\s*\/\s*(month|மாதம்|yr|year|ஆண்டு)/i)) {
      const parts = trimmed.split('/');
      let modified = false;
      const translatedParts = parts.map((part) => {
        const pTrimmed = part.trim();
        const pKey = pTrimmed.toLowerCase();
        if (normalizedDictionary.has(pKey)) {
          modified = true;
          return normalizedDictionary.get(pKey)[targetLang];
        }
        return pTrimmed;
      });
      if (modified) {
        return translatedParts.join(' / ');
      }
    }

    // 6. Handle compound values separated by commas (e.g. "Own House, Land", "சென்னை, தமிழ்நாடு", "T.Nagar, Chennai")
    if (trimmed.includes(',') && !trimmed.match(/^\s*₹?\s*[\d,]+(\/|\s*(month|மாதம்))?\s*$/)) {
      const parts = trimmed.split(',');
      let modified = false;
      const translatedParts = parts.map((part) => {
        const pTrimmed = part.trim();
        const pKey = pTrimmed.toLowerCase();
        if (normalizedDictionary.has(pKey)) {
          modified = true;
          return normalizedDictionary.get(pKey)[targetLang];
        }
        return pTrimmed;
      });
      if (modified) {
        return translatedParts.join(', ');
      }
    }

    // 7. Parenthesized terms (e.g. "B.E (Computer Science)", "MBA (Finance)", "ஆசிரியர் (அரசுப் பள்ளி)")
    const parenMatch = trimmed.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      const outerPart = parenMatch[1].trim();
      const innerPart = parenMatch[2].trim();
      const outerLower = outerPart.toLowerCase();
      const innerLower = innerPart.toLowerCase();

      const transOuter = normalizedDictionary.has(outerLower)
        ? normalizedDictionary.get(outerLower)[targetLang]
        : profileValueTranslations[outerPart]?.[targetLang] || outerPart;

      const transInner = normalizedDictionary.has(innerLower)
        ? normalizedDictionary.get(innerLower)[targetLang]
        : profileValueTranslations[innerPart]?.[targetLang] || innerPart;

      if (transOuter !== outerPart || transInner !== innerPart) {
        return `${transOuter} (${transInner})`;
      }
    }

    // 8. Dash / Hyphen separated terms (e.g. "B.E - EEE", "அபிராமம் - ராமநாதபுரம்")
    if (trimmed.includes(' - ') && !trimmed.match(/\d+\s*-\s*\d+/)) {
      const parts = trimmed.split(' - ');
      let modified = false;
      const translatedParts = parts.map((part) => {
        const pTrimmed = part.trim();
        const pKey = pTrimmed.toLowerCase();
        if (normalizedDictionary.has(pKey)) {
          modified = true;
          return normalizedDictionary.get(pKey)[targetLang];
        }
        return pTrimmed;
      });
      if (modified) {
        return translatedParts.join(' - ');
      }
    }

    // 9. Word-level replacement for compound phrases with known terms (e.g. "Software Engineer in Chennai")
    if (targetLang === 'ta' && /[a-zA-Z]/.test(trimmed)) {
      let phrase = trimmed;
      // Replace multi-word terms first, then single words
      const sortedKeys = Array.from(normalizedDictionary.keys())
        .filter((k) => k.length >= 4 && !/^\d+$/.test(k))
        .sort((a, b) => b.length - a.length);

      for (const k of sortedKeys) {
        const valObj = normalizedDictionary.get(k);
        if (valObj && valObj.ta && valObj.ta !== k) {
          const escKey = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escKey}\\b`, 'gi');
          if (regex.test(phrase)) {
            phrase = phrase.replace(regex, valObj.ta);
          }
        }
      }
      if (phrase !== trimmed) {
        return phrase;
      }
    }

    // Fallback: If not recognized as a matrimonial category term, return original value as-is.
    return val;
  };

  /**
   * Smart bidirectional name transliteration (English <-> Tamil).
   * - Translates English name to Tamil phonetic script when target is 'ta' (e.g. 'Raja' -> 'ராஜா', 'King' -> 'கிங்')
   * - Translates Tamil name to English phonetic name when target is 'en' (e.g. 'ராஜா' -> 'Raja')
   * - Avoids literal translations ('Raja' is never 'King').
   */
  const translateName = (name, overrideLang) => {
    if (!name || typeof name !== 'string') return name || '';
    const trimmed = name.trim();
    if (!trimmed) return trimmed;
    const targetLang = overrideLang || (language === 'en' ? 'en' : 'ta');
    return transliterateName(trimmed, targetLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateValue,
        translateName,
        isTamil: language === 'ta',
        isEnglish: language === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const translateName = (name, targetLang = 'ta') => {
  return transliterateName(name, targetLang);
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
