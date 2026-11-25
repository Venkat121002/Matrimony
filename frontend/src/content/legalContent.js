// Text of the three legal pages. Each section has an English and a Tamil version;
// `body` items are paragraphs, and an item starting with "• " is rendered as a bullet.

export const BUSINESS = {
  name: 'Tamil Muslim Nikkah',
  phone: '+91 93445 11158',
  whatsappUrl: 'https://wa.me/919344511158',
  hours: { en: '9.00 am - 9.00 pm, all 7 days', ta: 'காலை 9.00 - இரவு 9.00 (வாரத்தின் அனைத்து நாட்களும்)' },
};

export const LAST_UPDATED = '24 October 2026';

const contactSection = {
  title: { en: 'Contact Us', ta: 'எங்களைத் தொடர்பு கொள்ள' },
  body: {
    en: [
      `For any question about this page you can reach ${BUSINESS.name} on WhatsApp / phone at ${BUSINESS.phone} (${BUSINESS.hours.en}) or send a message through the Help Desk form available in the footer of our website.`,
    ],
    ta: [
      `இந்தப் பக்கம் தொடர்பான எந்தக் கேள்விக்கும் ${BUSINESS.name} ஐ வாட்ஸ்அப் / தொலைபேசி ${BUSINESS.phone} (${BUSINESS.hours.ta}) மூலமாகவோ, இணையதளத்தின் அடிப்பகுதியில் உள்ள உதவி மைய (Help Desk) படிவம் மூலமாகவோ தொடர்பு கொள்ளலாம்.`,
    ],
  },
};

export const LEGAL_PAGES = {
  'privacy-policy': {
    title: { en: 'Privacy Policy', ta: 'தனியுரிமைக் கொள்கை' },
    intro: {
      en: `${BUSINESS.name} ("we", "us", "our") runs a matrimonial service for Muslim brothers and sisters. We know that the details you share with us are personal and sensitive. This Privacy Policy explains what we collect, why we collect it, who can see it and what choices you have. By using our website you agree to this policy.`,
      ta: `${BUSINESS.name} ("நாங்கள்") இஸ்லாமிய சகோதர, சகோதரிகளுக்கான திருமண தகவல் சேவையை வழங்குகிறது. நீங்கள் எங்களிடம் பகிரும் தகவல்கள் தனிப்பட்டவை மற்றும் முக்கியமானவை என்பதை நாங்கள் அறிவோம். எந்தத் தகவலை நாங்கள் சேகரிக்கிறோம், ஏன் சேகரிக்கிறோம், யார் பார்க்க முடியும், உங்களுக்கு என்ன உரிமைகள் உள்ளன என்பதை இக்கொள்கை விளக்குகிறது. எங்கள் இணையதளத்தைப் பயன்படுத்துவதன் மூலம் இக்கொள்கையை ஏற்றுக்கொள்கிறீர்கள்.`,
    },
    sections: [
      {
        title: { en: 'Information We Collect', ta: 'நாங்கள் சேகரிக்கும் தகவல்கள்' },
        body: {
          en: [
            '• Account details: name, mobile number, email address, password (stored securely, never in readable form), gender, age, marital status.',
            '• Profile details: education, occupation, income range, height, complexion, native place and current location, family details, partner preferences and a short description about you.',
            '• Photos and an optional voice introduction that you upload.',
            '• Identity or verification documents, only where we ask for them to confirm a profile is genuine.',
            '• Payment details you send us: the screenshot of your UPI / GPay payment and, if you enter it, the UPI transaction ID. We do not collect or store your card number, bank account number, UPI PIN or any password of your payment app.',
            '• Help Desk messages you send us, and basic technical data such as browser type, device type and the pages you open.',
          ],
          ta: [
            '• கணக்கு விவரங்கள்: பெயர், கைபேசி எண், மின்னஞ்சல், கடவுச்சொல் (பாதுகாப்பாக மறைகுறியாக்கி சேமிக்கப்படும்), பாலினம், வயது, திருமண நிலை.',
            '• வரன் விவரங்கள்: படிப்பு, தொழில், வருமான வரம்பு, உயரம், நிறம், சொந்த ஊர் மற்றும் தற்போதைய இருப்பிடம், குடும்ப விவரங்கள், எதிர்பார்ப்புகள் மற்றும் உங்களைப் பற்றிய சிறு குறிப்பு.',
            '• நீங்கள் பதிவேற்றும் புகைப்படங்கள் மற்றும் விருப்பமுள்ளவர்களுக்கான குரல் அறிமுகம்.',
            '• வரன் உண்மையானது என்பதை உறுதிப்படுத்த நாங்கள் கேட்கும் போது மட்டும் அடையாள / சரிபார்ப்பு ஆவணங்கள்.',
            '• நீங்கள் அனுப்பும் கட்டண விவரங்கள்: UPI / GPay கட்டண ஸ்கிரீன்ஷாட் மற்றும் நீங்கள் உள்ளிட்டால் UPI பரிவர்த்தனை எண். உங்கள் அட்டை எண், வங்கிக் கணக்கு எண், UPI PIN அல்லது கட்டண செயலியின் கடவுச்சொல் ஆகியவற்றை நாங்கள் சேகரிக்கவோ சேமிக்கவோ மாட்டோம்.',
            '• நீங்கள் அனுப்பும் உதவி மைய செய்திகள் மற்றும் உலாவி வகை, சாதன வகை, பார்த்த பக்கங்கள் போன்ற அடிப்படை தொழில்நுட்பத் தகவல்கள்.',
          ],
        },
      },
      {
        title: { en: 'How We Use Your Information', ta: 'தகவல்களை நாங்கள் பயன்படுத்தும் விதம்' },
        body: {
          en: [
            '• To create and run your account and show your profile to other members.',
            '• To verify profiles and keep the community safe from fake or misleading profiles.',
            '• To confirm your payment and activate the membership or promotion you purchased.',
            '• To send you service messages such as OTP, password reset, payment confirmation and match suggestions by email or WhatsApp.',
            '• To answer your Help Desk queries and improve our service.',
            '• To meet legal obligations and prevent misuse or fraud.',
          ],
          ta: [
            '• உங்கள் கணக்கை உருவாக்கி இயக்கவும், உங்கள் வரனை மற்ற உறுப்பினர்களுக்குக் காட்டவும்.',
            '• போலி அல்லது தவறான வரன்களைத் தடுத்து சமூகத்தைப் பாதுகாக்க வரன்களைச் சரிபார்க்க.',
            '• உங்கள் கட்டணத்தை உறுதிசெய்து நீங்கள் வாங்கிய சந்தா அல்லது விளம்பரத்தைச் செயல்படுத்த.',
            '• OTP, கடவுச்சொல் மீட்பு, கட்டண உறுதி, பொருத்தமான வரன் பரிந்துரை போன்ற சேவை செய்திகளை மின்னஞ்சல் அல்லது வாட்ஸ்அப் மூலம் அனுப்ப.',
            '• உங்கள் உதவி மைய கேள்விகளுக்குப் பதிலளிக்கவும் சேவையை மேம்படுத்தவும்.',
            '• சட்டப்படியான கடமைகளை நிறைவேற்றவும் தவறான பயன்பாடு அல்லது மோசடியைத் தடுக்கவும்.',
          ],
        },
      },
      {
        title: { en: 'Who Can See Your Information', ta: 'உங்கள் தகவல்களை யார் பார்க்கலாம்' },
        body: {
          en: [
            '• Visitors who are not logged in see only limited profile details and cannot see photos.',
            '• Logged-in members can view the profile details you chose to publish. Direct contact details (phone numbers, WhatsApp) are shown only to Premium members.',
            '• Our administrators can see your profile, verification documents and payment screenshots to run and protect the service. Verification documents and payment screenshots are kept private and are never shown to other members.',
            '• We do not sell your personal information to anyone and we do not share it with advertisers.',
          ],
          ta: [
            '• உள்நுழையாத பார்வையாளர்கள் வரனின் குறைந்த விவரங்களை மட்டுமே காண முடியும்; புகைப்படங்களைக் காண முடியாது.',
            '• உள்நுழைந்த உறுப்பினர்கள் நீங்கள் வெளியிடத் தேர்ந்தெடுத்த வரன் விவரங்களைப் பார்க்கலாம். நேரடித் தொடர்பு எண்கள் (தொலைபேசி, வாட்ஸ்அப்) பிரீமியம் உறுப்பினர்களுக்கு மட்டுமே காட்டப்படும்.',
            '• சேவையை நடத்தவும் பாதுகாக்கவும் எங்கள் நிர்வாகிகள் உங்கள் வரன், சரிபார்ப்பு ஆவணங்கள் மற்றும் கட்டண ஸ்கிரீன்ஷாட்களைப் பார்க்க முடியும். சரிபார்ப்பு ஆவணங்களும் கட்டண ஸ்கிரீன்ஷாட்களும் தனிப்பட்டவையாக வைக்கப்படும்; பிற உறுப்பினர்களுக்குக் காட்டப்படாது.',
            '• உங்கள் தனிப்பட்ட தகவல்களை நாங்கள் யாருக்கும் விற்பதில்லை; விளம்பரதாரர்களுடனும் பகிர்வதில்லை.',
          ],
        },
      },
      {
        title: { en: 'Service Providers and Storage', ta: 'சேவை வழங்குநர்கள் மற்றும் சேமிப்பு' },
        body: {
          en: [
            'Your data is stored on Google Firebase / Google Cloud services (Firestore database, Cloud Storage and Authentication). We use an email service to send OTP and notification emails and WhatsApp (Meta Cloud API) to send OTP and verification messages. These providers process data only to provide their service to us and under their own security commitments.',
            'We may also disclose information if required by law, a court order or a government authority, or to protect the rights and safety of our members.',
          ],
          ta: [
            'உங்கள் தரவுகள் Google Firebase / Google Cloud சேவைகளில் (Firestore தரவுத்தளம், Cloud Storage மற்றும் Authentication) சேமிக்கப்படுகின்றன. OTP மற்றும் அறிவிப்பு மின்னஞ்சல்களை அனுப்ப மின்னஞ்சல் சேவையையும், OTP மற்றும் சரிபார்ப்பு செய்திகளை அனுப்ப WhatsApp (Meta Cloud API) ஐயும் பயன்படுத்துகிறோம். இந்த வழங்குநர்கள் எங்களுக்கு சேவை வழங்கும் நோக்கத்திற்காக மட்டுமே தரவுகளைக் கையாளுகின்றனர்.',
            'சட்டம், நீதிமன்ற உத்தரவு அல்லது அரசு அதிகாரியின் கோரிக்கை இருந்தால், அல்லது உறுப்பினர்களின் உரிமைகளையும் பாதுகாப்பையும் காக்க வேண்டியிருந்தால் தகவல்களை வெளியிடலாம்.',
          ],
        },
      },
      {
        title: { en: 'Payments', ta: 'கட்டணங்கள்' },
        body: {
          en: [
            'Membership and promotion fees are paid by scanning our UPI QR code with your own UPI app (GPay, PhonePe, Paytm, etc.). The payment is made directly between your UPI app and our bank account through the UPI network. We only receive the screenshot and transaction ID you upload so that our team can match the payment and activate your plan. We never see your UPI PIN or banking credentials.',
          ],
          ta: [
            'சந்தா மற்றும் விளம்பரக் கட்டணங்கள் எங்கள் UPI QR குறியீட்டை உங்கள் UPI செயலியில் (GPay, PhonePe, Paytm போன்றவை) ஸ்கேன் செய்து செலுத்தப்படுகின்றன. கட்டணம் UPI வலையமைப்பு வழியாக உங்கள் செயலியிலிருந்து எங்கள் வங்கிக் கணக்கிற்கு நேரடியாகச் செல்கிறது. கட்டணத்தைப் பொருத்தி உங்கள் திட்டத்தைச் செயல்படுத்த நீங்கள் பதிவேற்றும் ஸ்கிரீன்ஷாட் மற்றும் பரிவர்த்தனை எண்ணை மட்டுமே நாங்கள் பெறுகிறோம். உங்கள் UPI PIN அல்லது வங்கி விவரங்களை நாங்கள் ஒருபோதும் காண்பதில்லை.',
          ],
        },
      },
      {
        title: { en: 'How Long We Keep Your Data', ta: 'தரவுகளை எவ்வளவு காலம் வைத்திருப்போம்' },
        body: {
          en: [
            'We keep your profile while your account is active. When you delete your account, your profile, photos, voice introduction, verification documents and payment screenshots are removed from our systems. Basic payment records (amount, date, plan) may be kept for accounting and legal requirements.',
          ],
          ta: [
            'உங்கள் கணக்கு செயலில் இருக்கும் வரை உங்கள் வரனை வைத்திருப்போம். கணக்கை நீக்கினால் உங்கள் வரன், புகைப்படங்கள், குரல் அறிமுகம், சரிபார்ப்பு ஆவணங்கள் மற்றும் கட்டண ஸ்கிரீன்ஷாட்கள் எங்கள் அமைப்பிலிருந்து நீக்கப்படும். கணக்கு மற்றும் சட்டத் தேவைகளுக்காக அடிப்படை கட்டணப் பதிவுகள் (தொகை, தேதி, திட்டம்) வைக்கப்படலாம்.',
          ],
        },
      },
      {
        title: { en: 'Your Choices and Rights', ta: 'உங்கள் தேர்வுகளும் உரிமைகளும்' },
        body: {
          en: [
            '• You can view and update your profile details after you log in.',
            '• You can ask us to correct wrong information or to delete your account and data.',
            '• You can ask us to stop sending you email or WhatsApp messages that are not essential to the service.',
            'To use any of these rights, contact us using the details at the end of this page. We may need to confirm your identity first.',
          ],
          ta: [
            '• உள்நுழைந்த பிறகு உங்கள் வரன் விவரங்களைப் பார்க்கவும் திருத்தவும் முடியும்.',
            '• தவறான தகவலைத் திருத்தவோ, உங்கள் கணக்கையும் தரவுகளையும் நீக்கவோ எங்களிடம் கோரலாம்.',
            '• சேவைக்கு அவசியமில்லாத மின்னஞ்சல் அல்லது வாட்ஸ்அப் செய்திகளை நிறுத்துமாறு கோரலாம்.',
            'இவற்றில் எதையும் பயன்படுத்த, இப்பக்கத்தின் இறுதியில் உள்ள விவரங்கள் மூலம் எங்களைத் தொடர்பு கொள்ளவும். முதலில் உங்கள் அடையாளத்தை உறுதிசெய்ய வேண்டியிருக்கலாம்.',
          ],
        },
      },
      {
        title: { en: 'Security', ta: 'பாதுகாப்பு' },
        body: {
          en: [
            'Passwords are stored with a secure login service and never in readable form. Private files are kept in protected storage and can be opened only by our administrators. No system on the internet is completely secure, so please keep your password private and log out on shared devices.',
          ],
          ta: [
            'கடவுச்சொற்கள் பாதுகாப்பான உள்நுழைவு சேவையில் சேமிக்கப்படுகின்றன; படிக்கக்கூடிய வடிவில் அல்ல. தனிப்பட்ட கோப்புகள் பாதுகாக்கப்பட்ட சேமிப்பில் வைக்கப்பட்டு எங்கள் நிர்வாகிகள் மட்டுமே திறக்க முடியும். இணையத்தில் எந்த அமைப்பும் முழுமையாகப் பாதுகாப்பானதல்ல; எனவே உங்கள் கடவுச்சொல்லை ரகசியமாக வைத்து, பகிரப்பட்ட சாதனங்களில் வெளியேறவும்.',
          ],
        },
      },
      {
        title: { en: 'Cookies and Local Storage', ta: 'குக்கீகள் மற்றும் உள்ளூர் சேமிப்பு' },
        body: {
          en: [
            'We use your browser\'s local storage to keep you logged in and to remember your language choice. We do not use advertising cookies.',
          ],
          ta: [
            'உங்களை உள்நுழைந்த நிலையில் வைக்கவும் உங்கள் மொழித் தேர்வை நினைவில் வைக்கவும் உலாவியின் உள்ளூர் சேமிப்பைப் பயன்படுத்துகிறோம். விளம்பர குக்கீகளை நாங்கள் பயன்படுத்துவதில்லை.',
          ],
        },
      },
      {
        title: { en: 'Children', ta: 'சிறுவர்கள்' },
        body: {
          en: [
            'Our service is only for adults who are of legal marriageable age under Indian law. Parents or guardians may register a profile on behalf of their son or daughter. We do not knowingly collect information from anyone below the legal marriageable age.',
          ],
          ta: [
            'எங்கள் சேவை இந்திய சட்டப்படி திருமண வயதை எட்டிய வயது வந்தவர்களுக்கு மட்டுமே. பெற்றோர் அல்லது பாதுகாவலர்கள் தங்கள் மகன் அல்லது மகள் சார்பாக வரனைப் பதிவு செய்யலாம். சட்டப்படியான திருமண வயதுக்குக் குறைந்த யாரிடமிருந்தும் தெரிந்தே தகவல்களை நாங்கள் சேகரிப்பதில்லை.',
          ],
        },
      },
      {
        title: { en: 'Changes to This Policy', ta: 'இக்கொள்கையில் மாற்றங்கள்' },
        body: {
          en: [`We may update this policy from time to time. The date at the top shows when it was last changed. If you keep using the website after a change, you accept the updated policy.`],
          ta: ['இக்கொள்கையை அவ்வப்போது புதுப்பிக்கலாம். மேலே உள்ள தேதி கடைசியாக மாற்றிய நாளைக் காட்டுகிறது. மாற்றத்திற்குப் பிறகும் இணையதளத்தைப் பயன்படுத்தினால், புதுப்பித்த கொள்கையை ஏற்றுக்கொண்டதாகக் கருதப்படும்.'],
        },
      },
      contactSection,
    ],
  },

  'terms-conditions': {
    title: { en: 'Terms & Conditions', ta: 'விதிமுறைகளும் நிபந்தனைகளும்' },
    intro: {
      en: `Welcome to ${BUSINESS.name}. By registering on or using this website you agree to these Terms & Conditions. If you do not agree, please do not use the website.`,
      ta: `${BUSINESS.name} க்கு வரவேற்கிறோம். இவ்விணையதளத்தில் பதிவு செய்வதன் மூலம் அல்லது பயன்படுத்துவதன் மூலம் இந்த விதிமுறைகளையும் நிபந்தனைகளையும் ஏற்றுக்கொள்கிறீர்கள். ஏற்கவில்லை என்றால் இணையதளத்தைப் பயன்படுத்த வேண்டாம்.`,
    },
    sections: [
      {
        title: { en: 'About the Service', ta: 'சேவையைப் பற்றி' },
        body: {
          en: [
            `${BUSINESS.name} is an online platform that lets Muslim brothers, sisters and their families publish matrimonial profiles and find suitable matches. We are only an information and introduction service. We do not arrange marriages, and we are not a party to any communication, meeting or agreement between members.`,
          ],
          ta: [
            `${BUSINESS.name} என்பது இஸ்லாமிய சகோதர, சகோதரிகளும் அவர்களின் குடும்பங்களும் திருமண வரன்களை வெளியிடவும் பொருத்தமான வரன்களைத் தேடவும் உதவும் இணைய தளம். நாங்கள் தகவல் மற்றும் அறிமுக சேவை மட்டுமே வழங்குகிறோம். திருமணங்களை நாங்கள் ஏற்பாடு செய்வதில்லை; உறுப்பினர்களுக்கிடையேயான எந்த உரையாடல், சந்திப்பு அல்லது ஒப்பந்தத்திலும் நாங்கள் தரப்பினர் அல்ல.`,
          ],
        },
      },
      {
        title: { en: 'Eligibility', ta: 'தகுதி' },
        body: {
          en: [
            '• You must be of legal marriageable age under Indian law (18 years for a bride, 21 years for a groom) and legally free to marry.',
            '• A parent or guardian may register on behalf of a son or daughter and is responsible for the details given.',
            '• Overseas members may register using the Overseas Register option.',
          ],
          ta: [
            '• இந்திய சட்டப்படி திருமண வயதை (மணமகளுக்கு 18, மணமகனுக்கு 21) எட்டியவராகவும் சட்டப்படி திருமணம் செய்யத் தகுதியுடையவராகவும் இருக்க வேண்டும்.',
            '• பெற்றோர் அல்லது பாதுகாவலர் மகன் / மகள் சார்பாகப் பதிவு செய்யலாம்; கொடுக்கப்பட்ட விவரங்களுக்கு அவர்களே பொறுப்பு.',
            '• வெளிநாட்டு உறுப்பினர்கள் "வெளிநாட்டு வரன் பதிவு" வசதியைப் பயன்படுத்திப் பதிவு செய்யலாம்.',
          ],
        },
      },
      {
        title: { en: 'Your Account and Profile', ta: 'உங்கள் கணக்கு மற்றும் வரன்' },
        body: {
          en: [
            '• You must give true, accurate and complete information and keep it up to date. Using another person\'s photos or details is not allowed.',
            '• You are responsible for keeping your password secret and for all activity under your account.',
            '• New profiles are checked by our team before they appear publicly. We may approve, reject, edit or remove a profile if it breaks these terms or cannot be verified.',
            '• A profile once registered stays active for a minimum of one month, as stated in the registration declaration.',
          ],
          ta: [
            '• உண்மையான, சரியான, முழுமையான தகவல்களை வழங்கி அவற்றைப் புதுப்பித்து வைக்க வேண்டும். பிறரின் புகைப்படங்கள் அல்லது விவரங்களைப் பயன்படுத்தக் கூடாது.',
            '• உங்கள் கடவுச்சொல்லை ரகசியமாக வைக்கவும், உங்கள் கணக்கில் நடக்கும் அனைத்துச் செயல்களுக்கும் நீங்களே பொறுப்பு.',
            '• புதிய வரன்கள் பொதுவில் தோன்றும் முன் எங்கள் குழுவால் சரிபார்க்கப்படும். விதிமுறைகளை மீறினால் அல்லது சரிபார்க்க இயலவில்லை என்றால் வரனை ஏற்கவோ, நிராகரிக்கவோ, திருத்தவோ, நீக்கவோ எங்களுக்கு உரிமை உண்டு.',
            '• பதிவின் போது அளித்த உறுதிமொழியின்படி, பதிவு செய்த வரன் குறைந்தது ஒரு மாதம் செயலில் இருக்கும்.',
          ],
        },
      },
      {
        title: { en: 'Rules of Conduct', ta: 'நடத்தை விதிகள்' },
        body: {
          en: [
            'You agree not to:',
            '• ask for, offer or discuss dowry in any form; this is against Islamic teaching and Indian law;',
            '• post false, misleading, abusive, obscene or illegal content, or harass or threaten any member;',
            '• use the service for dating, commercial promotion, collecting money or any purpose other than finding a marriage partner;',
            '• copy, scrape or misuse other members\' details or contact numbers, or share them publicly;',
            '• try to break into, overload or interfere with the website.',
          ],
          ta: [
            'நீங்கள் பின்வருவனவற்றைச் செய்யக் கூடாது:',
            '• எந்த வடிவிலும் வரதட்சணை கேட்பது, வழங்குவது அல்லது பேசுவது; இது இஸ்லாமிய போதனைக்கும் இந்தியச் சட்டத்திற்கும் எதிரானது;',
            '• பொய்யான, தவறாக வழிநடத்தும், அவதூறான, ஆபாசமான அல்லது சட்டவிரோதமான உள்ளடக்கத்தை வெளியிடுவது, எந்த உறுப்பினரையும் தொந்தரவு செய்வது அல்லது மிரட்டுவது;',
            '• திருமணத் துணையைத் தேடுவதைத் தவிர்த்து டேட்டிங், வணிக விளம்பரம், பணம் வசூலித்தல் போன்றவற்றுக்குச் சேவையைப் பயன்படுத்துவது;',
            '• பிற உறுப்பினர்களின் விவரங்கள் அல்லது தொடர்பு எண்களை நகலெடுப்பது, தவறாகப் பயன்படுத்துவது அல்லது பொதுவில் பகிர்வது;',
            '• இணையதளத்தை ஊடுருவ, அதிகச் சுமையேற்ற அல்லது இடையூறு செய்ய முயல்வது.',
          ],
        },
      },
      {
        title: { en: 'Free and Premium Membership', ta: 'இலவச மற்றும் பிரீமியம் உறுப்பினர்' },
        body: {
          en: [
            'Registration is free. Free members can use the website with limits on the number of profiles they can view and choose. Premium members get the benefits listed on the upgrade screen, such as unlimited profile views, unlimited chosen profiles and access to contact numbers. Current prices and limits are shown on the website and may be changed by us for future purchases. Prices include applicable taxes.',
          ],
          ta: [
            'பதிவு இலவசம். இலவச உறுப்பினர்கள் பார்க்கக்கூடிய, தேர்வு செய்யக்கூடிய வரன்களின் எண்ணிக்கையில் வரம்புகளுடன் இணையதளத்தைப் பயன்படுத்தலாம். பிரீமியம் உறுப்பினர்கள் மேம்படுத்தும் திரையில் குறிப்பிடப்பட்டுள்ள வரம்பற்ற வரன் பார்வை, வரம்பற்ற வரன் தேர்வு, தொடர்பு எண்கள் போன்ற நன்மைகளைப் பெறுவர். தற்போதைய கட்டணங்களும் வரம்புகளும் இணையதளத்தில் காட்டப்படும்; எதிர்காலக் கொள்முதல்களுக்கு அவற்றை நாங்கள் மாற்றலாம். கட்டணங்கள் பொருந்தும் வரிகளை உள்ளடக்கியவை.',
          ],
        },
      },
      {
        title: { en: 'Payments and Activation', ta: 'கட்டணம் மற்றும் செயல்படுத்துதல்' },
        body: {
          en: [
            '• Payment is made by scanning our UPI QR code with a UPI app and paying the exact amount shown for the plan you choose.',
            '• After paying, you upload the screenshot of the successful payment on the website. Our team checks it against our bank / UPI records and then activates your plan. This is normally done within our working hours (9.00 am - 9.00 pm); it may take longer on holidays.',
            '• A plan is activated only after the payment is verified. Uploading a screenshot alone does not activate a plan. A wrong amount, unreadable or fake screenshot, or a payment we cannot find will be rejected and the reason shown to you.',
            '• Sending a fake or edited payment screenshot is fraud. We may suspend the account and take legal action.',
            '• Membership plans are valid for the period of the plan you bought (for example 30 days or 365 days) from the date of activation. Running Marquee Bar promotion is valid for the number of days shown at purchase.',
            '• Refunds and cancellations are governed by our Refund & Cancellation Policy.',
          ],
          ta: [
            '• நீங்கள் தேர்ந்தெடுத்த திட்டத்திற்குக் காட்டப்படும் சரியான தொகையை, எங்கள் UPI QR குறியீட்டை UPI செயலியில் ஸ்கேன் செய்து செலுத்த வேண்டும்.',
            '• கட்டணம் செலுத்திய பின் வெற்றிகரமான கட்டணத் திரையின் ஸ்கிரீன்ஷாட்டை இணையதளத்தில் பதிவேற்ற வேண்டும். எங்கள் குழு அதை வங்கி / UPI பதிவுகளுடன் சரிபார்த்து உங்கள் திட்டத்தைச் செயல்படுத்தும். இது வழக்கமாக எங்கள் பணி நேரத்தில் (காலை 9.00 - இரவு 9.00) நடைபெறும்; விடுமுறை நாட்களில் தாமதமாகலாம்.',
            '• கட்டணம் சரிபார்க்கப்பட்ட பின்பே திட்டம் செயல்படுத்தப்படும். ஸ்கிரீன்ஷாட்டை பதிவேற்றுவது மட்டும் திட்டத்தைச் செயல்படுத்தாது. தவறான தொகை, படிக்க இயலாத அல்லது போலி ஸ்கிரீன்ஷாட், அல்லது எங்களால் கண்டறிய முடியாத கட்டணம் நிராகரிக்கப்பட்டு காரணம் உங்களுக்குக் காட்டப்படும்.',
            '• போலியான அல்லது திருத்தப்பட்ட கட்டண ஸ்கிரீன்ஷாட்டை அனுப்புவது மோசடி. அத்தகைய கணக்கை நிறுத்தவும் சட்டப்படி நடவடிக்கை எடுக்கவும் எங்களுக்கு உரிமை உண்டு.',
            '• நீங்கள் வாங்கிய திட்டத்தின் காலத்திற்கு (எ.கா. 30 நாட்கள் அல்லது 365 நாட்கள்) செயல்படுத்திய நாளிலிருந்து சந்தா செல்லுபடியாகும். ஓடும் பட்டி விளம்பரம் வாங்கும் போது காட்டப்பட்ட நாட்களுக்குச் செல்லுபடியாகும்.',
            '• பணத்தைத் திரும்பப் பெறுதல் மற்றும் ரத்து செய்தல் எங்கள் பணத்தைத் திரும்பப் பெறுதல் & ரத்து கொள்கைப்படி நடைபெறும்.',
          ],
        },
      },
      {
        title: { en: 'No Guarantee of a Match', ta: 'வரன் அமைவதற்கு உத்தரவாதம் இல்லை' },
        body: {
          en: [
            'We do not promise that you will find a match or that any profile is free of errors. Information on profiles is provided by members. Our verification is a basic check and is not a background investigation. Before you proceed with any proposal, please meet the family, verify the details yourself and take advice from elders and trusted people. Any decision you take is at your own responsibility.',
          ],
          ta: [
            'உங்களுக்கு வரன் அமையும் என்றோ எந்த வரனும் பிழையற்றது என்றோ நாங்கள் உறுதியளிக்கவில்லை. வரன் விவரங்கள் உறுப்பினர்களால் வழங்கப்படுகின்றன. எங்கள் சரிபார்ப்பு அடிப்படை சரிபார்ப்பு மட்டுமே; அது பின்னணி விசாரணை அல்ல. எந்த வரனையும் முன்னெடுக்கும் முன் குடும்பத்தை நேரில் சந்தித்து, விவரங்களை நீங்களே சரிபார்த்து, பெரியவர்கள் மற்றும் நம்பகமானவர்களிடம் ஆலோசனை பெறுங்கள். நீங்கள் எடுக்கும் முடிவு உங்கள் பொறுப்பு.',
          ],
        },
      },
      {
        title: { en: 'Your Content', ta: 'உங்கள் உள்ளடக்கம்' },
        body: {
          en: [
            'You keep ownership of the photos and details you upload. You give us permission to store them and show them on the website as set by your profile, for the purpose of running the service. You confirm that you have the right to share them.',
          ],
          ta: [
            'நீங்கள் பதிவேற்றும் புகைப்படங்களுக்கும் விவரங்களுக்கும் நீங்களே உரிமையாளர். சேவையை நடத்தும் நோக்கத்திற்காக அவற்றைச் சேமிக்கவும், உங்கள் வரன் அமைப்பின்படி இணையதளத்தில் காட்டவும் எங்களுக்கு அனுமதி அளிக்கிறீர்கள். அவற்றைப் பகிர உங்களுக்கு உரிமை உண்டு என்பதை உறுதிப்படுத்துகிறீர்கள்.',
          ],
        },
      },
      {
        title: { en: 'Suspension and Termination', ta: 'நிறுத்துதல் மற்றும் முடித்தல்' },
        body: {
          en: [
            'We may suspend or delete an account without notice if it breaks these terms, contains false information, or is reported for misuse. You may delete your account at any time from your profile page, or by contacting us. Deleting or suspending an account does not by itself entitle you to a refund.',
          ],
          ta: [
            'இவ்விதிமுறைகளை மீறினால், பொய்யான தகவல் இருந்தால், அல்லது தவறான பயன்பாடு குறித்துப் புகார் வந்தால் அறிவிப்பின்றி கணக்கை நிறுத்தவோ நீக்கவோ முடியும். உங்கள் வரன் பக்கத்திலிருந்து அல்லது எங்களைத் தொடர்பு கொண்டு எந்த நேரத்திலும் கணக்கை நீக்கலாம். கணக்கை நீக்குவதால் அல்லது நிறுத்தப்படுவதால் மட்டும் பணம் திரும்பப் பெற உரிமை ஏற்படாது.',
          ],
        },
      },
      {
        title: { en: 'Limitation of Liability', ta: 'பொறுப்பு வரம்பு' },
        body: {
          en: [
            'The website is provided "as is". To the extent permitted by law, we are not responsible for the conduct of any member, for the accuracy of information provided by members, for any loss arising from a proposal, meeting or marriage arranged through the website, or for interruptions of the service. Our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim.',
          ],
          ta: [
            'இணையதளம் "இருக்கும் நிலையில்" வழங்கப்படுகிறது. சட்டம் அனுமதிக்கும் அளவிற்கு, எந்த உறுப்பினரின் நடத்தை, உறுப்பினர்கள் வழங்கும் தகவலின் துல்லியம், இணையதளம் வழியாக ஏற்பட்ட வரன், சந்திப்பு அல்லது திருமணத்தால் ஏற்படும் இழப்பு, அல்லது சேவை தடைபடுதல் ஆகியவற்றுக்கு நாங்கள் பொறுப்பல்ல. எந்தக் கோரிக்கைக்கும் எங்கள் மொத்தப் பொறுப்பு, கோரிக்கைக்கு முந்தைய 12 மாதங்களில் நீங்கள் எங்களுக்குச் செலுத்திய தொகைக்கு மட்டும் வரம்பிடப்படும்.',
          ],
        },
      },
      {
        title: { en: 'Governing Law', ta: 'பொருந்தும் சட்டம்' },
        body: {
          en: ['These terms are governed by the laws of India. Any dispute is subject to the jurisdiction of the courts in Tamil Nadu, India.'],
          ta: ['இவ்விதிமுறைகள் இந்தியச் சட்டங்களுக்கு உட்பட்டவை. எந்தவொரு சச்சரவும் இந்தியாவின் தமிழ்நாட்டில் உள்ள நீதிமன்றங்களின் அதிகார வரம்பிற்கு உட்பட்டது.'],
        },
      },
      {
        title: { en: 'Changes to These Terms', ta: 'இவ்விதிமுறைகளில் மாற்றங்கள்' },
        body: {
          en: ['We may update these terms from time to time. The date at the top shows the latest version. Continuing to use the website after a change means you accept the updated terms.'],
          ta: ['இவ்விதிமுறைகளை அவ்வப்போது புதுப்பிக்கலாம். மேலே உள்ள தேதி சமீபத்திய பதிப்பைக் காட்டுகிறது. மாற்றத்திற்குப் பிறகும் இணையதளத்தைப் பயன்படுத்தினால் புதுப்பித்த விதிமுறைகளை ஏற்றுக்கொண்டதாகக் கருதப்படும்.'],
        },
      },
      contactSection,
    ],
  },

  'terms-of-service': {
    title: { en: 'Terms of Service', ta: 'சேவை விதிமுறைகள்' },
    intro: {
      en: `These Terms of Service ("Terms") are the agreement between you and ${BUSINESS.name} for using our website and the paid services we offer on it. Please read them carefully. By creating an account, paying for a service or otherwise using the website, you accept these Terms.`,
      ta: `இந்த சேவை விதிமுறைகள் ("விதிமுறைகள்"), எங்கள் இணையதளத்தையும் அதில் நாங்கள் வழங்கும் கட்டணச் சேவைகளையும் பயன்படுத்துவது தொடர்பாக உங்களுக்கும் ${BUSINESS.name} க்கும் இடையிலான ஒப்பந்தம். கவனமாகப் படிக்கவும். கணக்கை உருவாக்குவதன் மூலம், ஒரு சேவைக்குக் கட்டணம் செலுத்துவதன் மூலம் அல்லது இணையதளத்தைப் பயன்படுத்துவதன் மூலம் இவ்விதிமுறைகளை ஏற்றுக்கொள்கிறீர்கள்.`,
    },
    sections: [
      {
        title: { en: 'Our Services', ta: 'எங்கள் சேவைகள்' },
        body: {
          en: [
            `${BUSINESS.name} provides an online matrimonial listing and introduction service for Muslim brothers, sisters and their families. The services include:`,
            '• Free registration and publishing of a matrimonial profile.',
            '• Searching, viewing and choosing profiles, with limits for free members.',
            '• Premium Membership (Monthly or Annual): unlimited profile views, unlimited chosen profiles and access to contact details for the plan period.',
            '• Running Marquee Bar promotion: your profile is shown in the scrolling bar at the top of the website for the stated number of days.',
            'We are an introduction platform only. We do not arrange marriages and we do not guarantee that any member will find a match.',
          ],
          ta: [
            `${BUSINESS.name} இஸ்லாமிய சகோதர, சகோதரிகளுக்கும் அவர்களின் குடும்பங்களுக்கும் இணைய வழி திருமண வரன் பட்டியல் மற்றும் அறிமுக சேவையை வழங்குகிறது. சேவைகள்:`,
            '• இலவசப் பதிவு மற்றும் திருமண வரன் வெளியீடு.',
            '• வரன்களைத் தேடுதல், பார்த்தல், தேர்வு செய்தல் (இலவச உறுப்பினர்களுக்கு வரம்புகளுடன்).',
            '• பிரீமியம் சந்தா (மாதாந்திரம் அல்லது வருடாந்திரம்): திட்ட காலத்திற்கு வரம்பற்ற வரன் பார்வை, வரம்பற்ற வரன் தேர்வு மற்றும் தொடர்பு விவரங்களுக்கான அணுகல்.',
            '• ஓடும் பட்டி விளம்பரம்: குறிப்பிட்ட நாட்களுக்கு இணையதளத்தின் மேலே ஓடும் பட்டியில் உங்கள் வரன் காட்டப்படும்.',
            'நாங்கள் அறிமுகத் தளம் மட்டுமே. திருமணங்களை ஏற்பாடு செய்வதில்லை; எந்த உறுப்பினருக்கும் வரன் அமையும் என்று உத்தரவாதம் அளிப்பதில்லை.',
          ],
        },
      },
      {
        title: { en: 'Eligibility and Accounts', ta: 'தகுதி மற்றும் கணக்குகள்' },
        body: {
          en: [
            '• You must be of legal marriageable age under Indian law (18 years for a bride, 21 years for a groom) and legally free to marry. A parent or guardian may register on behalf of a son or daughter.',
            '• You must give true and complete information and keep it updated. You are responsible for your password and for everything done through your account.',
            '• New profiles are reviewed by our team before they appear publicly. We may reject, edit or remove a profile that is false, incomplete or breaks these Terms.',
          ],
          ta: [
            '• இந்திய சட்டப்படி திருமண வயதை (மணமகளுக்கு 18, மணமகனுக்கு 21) எட்டியவராகவும் சட்டப்படி திருமணம் செய்யத் தகுதியுடையவராகவும் இருக்க வேண்டும். பெற்றோர் அல்லது பாதுகாவலர் மகன் / மகள் சார்பாகப் பதிவு செய்யலாம்.',
            '• உண்மையான, முழுமையான தகவல்களை வழங்கி அவற்றைப் புதுப்பித்து வைக்க வேண்டும். உங்கள் கடவுச்சொல்லுக்கும் உங்கள் கணக்கு வழியாகச் செய்யப்படும் அனைத்திற்கும் நீங்களே பொறுப்பு.',
            '• புதிய வரன்கள் பொதுவில் தோன்றும் முன் எங்கள் குழுவால் சரிபார்க்கப்படும். பொய்யான, முழுமையற்ற அல்லது இவ்விதிமுறைகளை மீறும் வரனை நிராகரிக்கவோ, திருத்தவோ, நீக்கவோ எங்களுக்கு உரிமை உண்டு.',
          ],
        },
      },
      {
        title: { en: 'Fees and Payment', ta: 'கட்டணம் மற்றும் செலுத்துதல்' },
        body: {
          en: [
            '• The price of each paid service is shown on the website before you pay, in Indian Rupees and including applicable taxes. We may change prices for future purchases.',
            '• You pay by scanning our UPI QR code with your own UPI app (GPay, PhonePe, Paytm, etc.) and paying the exact amount shown. You then upload a screenshot of the successful payment on the website.',
            '• Our team verifies the payment against our bank / UPI records and then activates the service, normally within our working hours (9.00 am - 9.00 pm). A service starts only after this verification, and the plan period counts from the date of activation.',
            '• A payment with a wrong amount, an unclear or edited screenshot, or one we cannot find will be rejected and the reason shown to you. Submitting a fake or edited screenshot is fraud and may lead to account suspension and legal action.',
            '• We never ask for your UPI PIN, card number or bank password.',
          ],
          ta: [
            '• ஒவ்வொரு கட்டணச் சேவையின் விலையும் நீங்கள் செலுத்தும் முன் இணையதளத்தில் இந்திய ரூபாயில், பொருந்தும் வரிகளுடன் காட்டப்படும். எதிர்காலக் கொள்முதல்களுக்கான விலைகளை மாற்றலாம்.',
            '• உங்கள் UPI செயலியில் (GPay, PhonePe, Paytm போன்றவை) எங்கள் UPI QR குறியீட்டை ஸ்கேன் செய்து, காட்டப்பட்ட சரியான தொகையைச் செலுத்த வேண்டும். பின்னர் வெற்றிகரமான கட்டணத்தின் ஸ்கிரீன்ஷாட்டை இணையதளத்தில் பதிவேற்ற வேண்டும்.',
            '• எங்கள் குழு கட்டணத்தை வங்கி / UPI பதிவுகளுடன் சரிபார்த்து, வழக்கமாக எங்கள் பணி நேரத்தில் (காலை 9.00 - இரவு 9.00) சேவையைச் செயல்படுத்தும். இந்தச் சரிபார்ப்புக்குப் பின்பே சேவை தொடங்கும்; திட்ட காலம் செயல்படுத்திய நாளிலிருந்து கணக்கிடப்படும்.',
            '• தவறான தொகை, தெளிவற்ற அல்லது திருத்தப்பட்ட ஸ்கிரீன்ஷாட், அல்லது எங்களால் கண்டறிய முடியாத கட்டணம் நிராகரிக்கப்பட்டு காரணம் காட்டப்படும். போலி அல்லது திருத்தப்பட்ட ஸ்கிரீன்ஷாட்டை அனுப்புவது மோசடி; கணக்கு நிறுத்தம் மற்றும் சட்ட நடவடிக்கைக்கு வழிவகுக்கும்.',
            '• உங்கள் UPI PIN, அட்டை எண் அல்லது வங்கி கடவுச்சொல்லை நாங்கள் ஒருபோதும் கேட்க மாட்டோம்.',
          ],
        },
      },
      {
        title: { en: 'Refunds and Cancellation', ta: 'பணம் திரும்பப் பெறுதல் மற்றும் ரத்து' },
        body: {
          en: [
            'Payments are non-refundable once a service has been activated, except in the cases listed in our Refund & Cancellation Policy (duplicate payment, excess payment, or a service we could not activate). Plans do not renew automatically. Please read the Refund & Cancellation Policy page before you pay.',
          ],
          ta: [
            'ஒரு சேவை செயல்படுத்தப்பட்ட பின் செலுத்திய கட்டணத்தைத் திரும்பப் பெற இயலாது; எங்கள் பணம் திரும்பப் பெறுதல் & ரத்து கொள்கையில் குறிப்பிடப்பட்ட நிலைகள் (இரட்டைக் கட்டணம், கூடுதல் கட்டணம், அல்லது எங்களால் செயல்படுத்த இயலாத சேவை) தவிர. திட்டங்கள் தானாகப் புதுப்பிக்கப்படாது. கட்டணம் செலுத்தும் முன் பணம் திரும்பப் பெறுதல் & ரத்து கொள்கைப் பக்கத்தைப் படிக்கவும்.',
          ],
        },
      },
      {
        title: { en: 'Acceptable Use', ta: 'ஏற்கத்தக்க பயன்பாடு' },
        body: {
          en: [
            'You agree to use the website only to look for a marriage partner, honestly and lawfully. You must not ask for or offer dowry, post false, abusive, obscene or illegal content, harass any member, copy or misuse other members\' details, or try to break into or disturb the website. Our Terms & Conditions page lists the full rules of conduct.',
          ],
          ta: [
            'திருமணத் துணையைத் தேடுவதற்காக மட்டும், நேர்மையாகவும் சட்டப்படியும் இணையதளத்தைப் பயன்படுத்த ஒப்புக்கொள்கிறீர்கள். வரதட்சணை கேட்கவோ வழங்கவோ கூடாது; பொய்யான, அவதூறான, ஆபாசமான அல்லது சட்டவிரோத உள்ளடக்கத்தை வெளியிடவோ, உறுப்பினர்களைத் தொந்தரவு செய்யவோ, பிறரின் விவரங்களை நகலெடுக்கவோ தவறாகப் பயன்படுத்தவோ, இணையதளத்தை ஊடுருவ அல்லது இடையூறு செய்ய முயலவோ கூடாது. முழு நடத்தை விதிகள் எங்கள் விதிமுறைகளும் நிபந்தனைகளும் பக்கத்தில் உள்ளன.',
          ],
        },
      },
      {
        title: { en: 'Intellectual Property and Your Content', ta: 'அறிவுசார் சொத்து மற்றும் உங்கள் உள்ளடக்கம்' },
        body: {
          en: [
            `The website, its design, name, logo and software belong to ${BUSINESS.name} and may not be copied or reused without our written permission. You keep ownership of the photos and details you upload and allow us to store and display them on the website as set by your profile, so that we can run the service.`,
          ],
          ta: [
            `இணையதளம், அதன் வடிவமைப்பு, பெயர், இலச்சினை மற்றும் மென்பொருள் ${BUSINESS.name} க்கு உரியவை; எங்கள் எழுத்துப்பூர்வ அனுமதியின்றி நகலெடுக்கவோ மீண்டும் பயன்படுத்தவோ கூடாது. நீங்கள் பதிவேற்றும் புகைப்படங்களுக்கும் விவரங்களுக்கும் நீங்களே உரிமையாளர்; சேவையை நடத்த, உங்கள் வரன் அமைப்பின்படி அவற்றைச் சேமிக்கவும் இணையதளத்தில் காட்டவும் எங்களுக்கு அனுமதி அளிக்கிறீர்கள்.`,
          ],
        },
      },
      {
        title: { en: 'Disclaimer and Limitation of Liability', ta: 'மறுப்பு மற்றும் பொறுப்பு வரம்பு' },
        body: {
          en: [
            'Profiles are created by members, and our verification is only a basic check, not a background investigation. Please meet the family and verify details yourself before any decision. The website is provided "as is". To the extent allowed by law we are not responsible for the conduct of members, the accuracy of their information, any loss from a proposal or marriage arranged through the website, or interruptions of the service. Our total liability for any claim is limited to the amount you paid us in the 12 months before the claim.',
          ],
          ta: [
            'வரன்கள் உறுப்பினர்களால் உருவாக்கப்படுகின்றன; எங்கள் சரிபார்ப்பு அடிப்படை சரிபார்ப்பு மட்டுமே, பின்னணி விசாரணை அல்ல. எந்த முடிவுக்கும் முன் குடும்பத்தை நேரில் சந்தித்து விவரங்களை நீங்களே சரிபார்க்கவும். இணையதளம் "இருக்கும் நிலையில்" வழங்கப்படுகிறது. சட்டம் அனுமதிக்கும் அளவிற்கு, உறுப்பினர்களின் நடத்தை, அவர்களின் தகவலின் துல்லியம், இணையதளம் வழியாக ஏற்பட்ட வரன் அல்லது திருமணத்தால் ஏற்படும் இழப்பு, அல்லது சேவை தடைபடுதல் ஆகியவற்றுக்கு நாங்கள் பொறுப்பல்ல. எந்தக் கோரிக்கைக்கும் எங்கள் மொத்தப் பொறுப்பு, கோரிக்கைக்கு முந்தைய 12 மாதங்களில் நீங்கள் எங்களுக்குச் செலுத்திய தொகைக்கு வரம்பிடப்படும்.',
          ],
        },
      },
      {
        title: { en: 'Suspension and Termination', ta: 'நிறுத்துதல் மற்றும் முடித்தல்' },
        body: {
          en: [
            'We may suspend or delete an account, without notice, if it breaks these Terms, contains false information or is reported for misuse. You may stop using the service or delete your account at any time. Suspension or deletion does not by itself entitle you to a refund.',
          ],
          ta: [
            'இவ்விதிமுறைகளை மீறினால், பொய்யான தகவல் இருந்தால் அல்லது தவறான பயன்பாடு குறித்துப் புகார் வந்தால் அறிவிப்பின்றி கணக்கை நிறுத்தவோ நீக்கவோ முடியும். நீங்கள் எந்த நேரத்திலும் சேவையைப் பயன்படுத்துவதை நிறுத்தலாம் அல்லது கணக்கை நீக்கலாம். கணக்கு நிறுத்தம் அல்லது நீக்கத்தால் மட்டும் பணம் திரும்பப் பெற உரிமை ஏற்படாது.',
          ],
        },
      },
      {
        title: { en: 'Privacy', ta: 'தனியுரிமை' },
        body: {
          en: ['How we collect and use your information is explained in our Privacy Policy, which forms part of these Terms.'],
          ta: ['உங்கள் தகவல்களை நாங்கள் எவ்வாறு சேகரித்துப் பயன்படுத்துகிறோம் என்பது எங்கள் தனியுரிமைக் கொள்கையில் விளக்கப்பட்டுள்ளது; அது இவ்விதிமுறைகளின் ஒரு பகுதி.'],
        },
      },
      {
        title: { en: 'Changes, Governing Law and Disputes', ta: 'மாற்றங்கள், பொருந்தும் சட்டம் மற்றும் சச்சரவுகள்' },
        body: {
          en: [
            'We may update these Terms from time to time; the date at the top shows the latest version, and continuing to use the website means you accept the update. These Terms are governed by the laws of India, and any dispute is subject to the jurisdiction of the courts in Tamil Nadu, India.',
          ],
          ta: [
            'இவ்விதிமுறைகளை அவ்வப்போது புதுப்பிக்கலாம்; மேலே உள்ள தேதி சமீபத்திய பதிப்பைக் காட்டுகிறது; இணையதளத்தைத் தொடர்ந்து பயன்படுத்தினால் புதுப்பிப்பை ஏற்றுக்கொண்டதாகக் கருதப்படும். இவ்விதிமுறைகள் இந்தியச் சட்டங்களுக்கு உட்பட்டவை; எந்தவொரு சச்சரவும் இந்தியாவின் தமிழ்நாட்டில் உள்ள நீதிமன்றங்களின் அதிகார வரம்பிற்கு உட்பட்டது.',
          ],
        },
      },
      contactSection,
    ],
  },

  'refund-cancellation-policy': {
    title: { en: 'Refund & Cancellation Policy', ta: 'பணத்தைத் திரும்பப் பெறுதல் & ரத்து கொள்கை' },
    intro: {
      en: `This policy explains when payments made to ${BUSINESS.name} can be refunded or cancelled. Please read it before you pay.`,
      ta: `${BUSINESS.name} க்குச் செலுத்திய கட்டணங்கள் எப்போது திரும்பப் பெறப்படலாம் அல்லது ரத்து செய்யப்படலாம் என்பதை இக்கொள்கை விளக்குகிறது. கட்டணம் செலுத்தும் முன் தயவுசெய்து படிக்கவும்.`,
    },
    sections: [
      {
        title: { en: 'What You Pay For', ta: 'நீங்கள் எதற்காகக் கட்டணம் செலுத்துகிறீர்கள்' },
        body: {
          en: [
            '• Premium Membership (Monthly or Annual): unlimited profile views, unlimited chosen profiles and access to contact details for the plan period.',
            '• Running Marquee Bar promotion: your profile is shown in the scrolling bar at the top of the website for the stated number of days.',
            'Registration on the website is free.',
          ],
          ta: [
            '• பிரீமியம் சந்தா (மாதாந்திரம் அல்லது வருடாந்திரம்): திட்ட காலத்திற்கு வரம்பற்ற வரன் பார்வை, வரம்பற்ற வரன் தேர்வு மற்றும் தொடர்பு விவரங்களுக்கான அணுகல்.',
            '• ஓடும் பட்டி விளம்பரம்: குறிப்பிட்ட நாட்களுக்கு இணையதளத்தின் மேலே ஓடும் பட்டியில் உங்கள் வரன் காட்டப்படும்.',
            'இணையதளத்தில் பதிவு செய்வது இலவசம்.',
          ],
        },
      },
      {
        title: { en: 'No Refund After Activation', ta: 'செயல்படுத்திய பின் பணம் திரும்பாது' },
        body: {
          en: [
            'Because the benefits of a plan start as soon as it is activated, payments are non-refundable once your Premium Membership or Running Marquee Bar promotion has been activated. This applies if you stop using the service, delete your account, change your mind, or do not find a match.',
          ],
          ta: [
            'திட்டத்தின் நன்மைகள் செயல்படுத்தியவுடன் தொடங்குவதால், உங்கள் பிரீமியம் சந்தா அல்லது ஓடும் பட்டி விளம்பரம் செயல்படுத்தப்பட்ட பின் செலுத்திய கட்டணம் திரும்பப் பெற இயலாது. சேவையைப் பயன்படுத்துவதை நிறுத்தினாலும், கணக்கை நீக்கினாலும், மனம் மாறினாலும், அல்லது வரன் அமையாவிட்டாலும் இது பொருந்தும்.',
          ],
        },
      },
      {
        title: { en: 'When We Refund', ta: 'நாங்கள் எப்போது பணத்தைத் திருப்பித் தருவோம்' },
        body: {
          en: [
            'We will refund the amount in full if:',
            '• you paid and your plan could not be activated because of a problem on our side;',
            '• the same plan was paid for twice by mistake (the extra payment is refunded); or',
            '• you paid more than the price of the plan (the excess amount is refunded).',
            'Refunds are made to the same UPI / bank account the payment came from, within 7 working days after we confirm the claim.',
          ],
          ta: [
            'பின்வரும் நிலைகளில் தொகையை முழுமையாகத் திருப்பித் தருவோம்:',
            '• நீங்கள் கட்டணம் செலுத்தியும் எங்கள் தரப்புப் பிரச்சினையால் உங்கள் திட்டத்தைச் செயல்படுத்த இயலாதபோது;',
            '• ஒரே திட்டத்திற்குத் தவறுதலாக இரண்டு முறை செலுத்தியபோது (கூடுதல் கட்டணம் திருப்பித் தரப்படும்); அல்லது',
            '• திட்டத்தின் விலையை விட அதிகமாகச் செலுத்தியபோது (கூடுதல் தொகை திருப்பித் தரப்படும்).',
            'கோரிக்கையை உறுதிசெய்த பின் 7 வேலை நாட்களுக்குள், கட்டணம் வந்த அதே UPI / வங்கிக் கணக்கிற்குத் திரும்பச் செலுத்தப்படும்.',
          ],
        },
      },
      {
        title: { en: 'Rejected or Pending Payments', ta: 'நிராகரிக்கப்பட்ட அல்லது நிலுவையில் உள்ள கட்டணங்கள்' },
        body: {
          en: [
            'If your screenshot is rejected (for example a wrong amount or an unclear image) the reason is shown on the payment screen. If money was debited from your account but we cannot find it, please contact us with the screenshot and transaction ID; we will trace it and either activate your plan or refund the amount. Money debited but not received by us is normally returned by your bank / UPI app within a few working days.',
          ],
          ta: [
            'உங்கள் ஸ்கிரீன்ஷாட் நிராகரிக்கப்பட்டால் (எ.கா. தவறான தொகை அல்லது தெளிவற்ற படம்) காரணம் கட்டணத் திரையில் காட்டப்படும். உங்கள் கணக்கிலிருந்து பணம் எடுக்கப்பட்டும் எங்களால் கண்டறிய இயலவில்லை என்றால், ஸ்கிரீன்ஷாட் மற்றும் பரிவர்த்தனை எண்ணுடன் எங்களைத் தொடர்பு கொள்ளவும்; தேடிப்பார்த்து உங்கள் திட்டத்தைச் செயல்படுத்துவோம் அல்லது தொகையைத் திருப்பித் தருவோம். பணம் எடுக்கப்பட்டு எங்களுக்கு வராத தொகை வழக்கமாக உங்கள் வங்கி / UPI செயலியால் சில வேலை நாட்களில் திருப்பித் தரப்படும்.',
          ],
        },
      },
      {
        title: { en: 'Cancellation', ta: 'ரத்து செய்தல்' },
        body: {
          en: [
            'You can stop using the service at any time. Plans do not renew automatically, so there is nothing to cancel and you will not be charged again unless you pay again yourself. If you want to cancel a payment you have not yet uploaded the screenshot for, simply do not submit it. If you have already submitted it and it has not been activated yet, contact us and we will reject the request and refund the amount.',
          ],
          ta: [
            'எந்த நேரத்திலும் சேவையைப் பயன்படுத்துவதை நிறுத்தலாம். திட்டங்கள் தானாகப் புதுப்பிக்கப்படாது; எனவே ரத்து செய்ய ஏதுமில்லை, நீங்களே மீண்டும் செலுத்தாத வரை மீண்டும் கட்டணம் வசூலிக்கப்படாது. ஸ்கிரீன்ஷாட்டை இன்னும் பதிவேற்றாத கட்டணத்தை ரத்து செய்ய, அதை அனுப்பாமல் விட்டால் போதும். ஏற்கனவே அனுப்பி இன்னும் செயல்படுத்தப்படவில்லை என்றால், எங்களைத் தொடர்பு கொள்ளுங்கள்; கோரிக்கையை நிராகரித்துத் தொகையைத் திருப்பித் தருவோம்.',
          ],
        },
      },
      {
        title: { en: 'How to Request a Refund', ta: 'பணத்தைத் திரும்பக் கோருவது எப்படி' },
        body: {
          en: [
            'Contact us with your Nikah ID, registered mobile number, the payment screenshot and the reason for your request. We will reply within 2 working days.',
          ],
          ta: [
            'உங்கள் நிக்காஹ் ஐடி, பதிவு செய்த கைபேசி எண், கட்டண ஸ்கிரீன்ஷாட் மற்றும் கோரிக்கைக்கான காரணத்துடன் எங்களைத் தொடர்பு கொள்ளவும். 2 வேலை நாட்களுக்குள் பதிலளிப்போம்.',
          ],
        },
      },
      contactSection,
    ],
  },
};

export const LEGAL_LINKS = [
  { path: '/privacy-policy', key: 'privacy-policy' },
  { path: '/terms-conditions', key: 'terms-conditions' },
  { path: '/terms-of-service', key: 'terms-of-service' },
  { path: '/refund-cancellation-policy', key: 'refund-cancellation-policy' },
];
