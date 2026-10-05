/**
 * Tamil Phonetic Transliteration Utility & Bidirectional Name Translation
 * Converts English phonetic typing into authentic Tamil Unicode characters
 * and provides robust, natural transliteration of names between English and Tamil.
 */

export const nameDictionaryEnToTa = {
  // Common Muslim Female Names & Surnames
  nasrin: 'நஸ்ரின்',
  nasreen: 'நஸ்ரீன்',
  banu: 'பானு',
  bano: 'பானு',
  parvin: 'பர்வீன்',
  parveen: 'பர்வீன்',
  yasmin: 'யாஸ்மின்',
  yasmeen: 'யாஸ்மின்',
  tasnim: 'தஸ்னீம்',
  tasneem: 'தஸ்னீம்',
  sameera: 'சமீரா',
  samira: 'சமீரா',
  shameem: 'ஷமீம்',
  shamim: 'ஷமீம்',
  shabana: 'ஷபானா',
  shabnam: 'ஷப்னம்',
  shereen: 'ஷெரின்',
  shireen: 'ஷிரீன்',
  salma: 'சல்மா',
  sumaya: 'சுமையா',
  sumaiya: 'சுமையா',
  sumayya: 'சுமையா',
  fathima: 'பாத்திமா',
  fatima: 'பாத்திமா',
  fatma: 'பாத்திமா',
  ayesha: 'ஆயிஷா',
  aisha: 'ஆயிஷா',
  ayisha: 'ஆயிஷா',
  beevi: 'பீவி',
  bivi: 'பீவி',
  bevi: 'பீவி',
  begum: 'பேகம்',
  begam: 'பேகம்',
  khatoon: 'காத்தூன்',
  khatun: 'காத்தூன்',
  nisa: 'நிஷா',
  unissa: 'உன்னிசா',
  sultana: 'சுல்தானா',
  safia: 'சபியா',
  safiya: 'சபியா',
  afreen: 'அப்ரீன்',
  rubina: 'ருபீனா',
  nisha: 'நிஷா',
  firdous: 'பிர்தௌஸ்',
  zoya: 'சோயா',
  amina: 'ஆமினா',
  aamina: 'ஆமினா',
  khadija: 'கதீஜா',
  khadeeja: 'கதீஜா',
  sana: 'சனா',
  heena: 'ஹீனா',
  hina: 'ஹீனா',
  rihana: 'ரிஹானா',
  rehana: 'ரெஹானா',
  razia: 'ரஸியா',
  raziya: 'ரஸியா',
  roshni: 'ரோஷ்னி',
  roshan: 'ரோஷன்',
  benazir: 'பெனாசிர்',
  mumtaz: 'மும்தாஜ்',
  noorjahan: 'நூர்ஜஹான்',
  asifa: 'ஆசிபா',
  aseefa: 'ஆசீபா',
  arifa: 'ஆரிபா',
  habiba: 'ஹபீபா',
  nazira: 'நசீரா',
  shakila: 'ஷகீலா',
  jameela: 'ஜமீலா',
  farzana: 'பர்சானா',
  farhana: 'பர்ஹானா',
  farida: 'பரிதா',
  rashida: 'ரஷீதா',
  waheeda: 'வஹீதா',
  sajida: 'சாஜிதா',
  majida: 'மாஜிதா',
  abida: 'ஆபிதா',
  zahira: 'ஜாஹிரா',
  tabassum: 'தபஸ்சும்',
  tahira: 'தாஹிரா',
  mubeena: 'முபீனா',
  sabira: 'சபிரா',
  shaheen: 'ஷாஹீன்',
  shahida: 'ஷாஹிதா',
  faiza: 'பைசா',
  hafsa: 'ஹப்ஸா',
  maryam: 'மர்யம்',
  mariam: 'மர்யம்',
  zainab: 'ஜைனப்',
  asma: 'அஸ்மா',
  syeda: 'சையதா',

  // Common Muslim Male Names & Titles
  raja: 'ராஜா',
  john: 'ஜான்',
  mohamed: 'முகமது',
  mohammed: 'முஹம்மது',
  muhammad: 'முஹம்மது',
  muhammed: 'முஹம்மது',
  mohamad: 'முகமது',
  ali: 'அலி',
  abdul: 'அப்துல்',
  rahman: 'ரஹ்மான்',
  rahuman: 'ரஹ்மான்',
  rahim: 'ரஹீம்',
  raheem: 'ரஹீம்',
  karim: 'கரீம்',
  kareem: 'கரீம்',
  syed: 'சையத்',
  sayed: 'சையத்',
  bilal: 'பிலால்',
  ibrahim: 'இப்ராஹிம்',
  ibraheem: 'இப்ராஹிம்',
  ismail: 'இஸ்மாயில்',
  ismael: 'இஸ்மாயில்',
  ishaq: 'இஸ்ஹாக்',
  yusuf: 'யூசுப்',
  yousuf: 'யூசுப்',
  ahmed: 'அஹ்மத்',
  ahmad: 'அஹ்மத்',
  arshath: 'அர்ஷத்',
  arshad: 'அர்ஷத்',
  sultan: 'சுல்தான்',
  sulthan: 'சுல்தான்',
  hameed: 'ஹமீது',
  hamid: 'ஹமீது',
  sheik: 'ஷேக்',
  shaik: 'ஷேக்',
  sheikh: 'ஷேக்',
  dawood: 'தாவூத்',
  dhawood: 'தாவூத்',
  jaffer: 'ஜாஃபர்',
  jafar: 'ஜாஃபர்',
  sameer: 'சமீர்',
  samir: 'சமீர்',
  zubair: 'சுபைர்',
  subair: 'சுபைர்',
  riyaz: 'ரியாஸ்',
  riyas: 'ரியாஸ்',
  aslam: 'அஸ்லம்',
  tariq: 'தாரிக்',
  thariq: 'தாரிக்',
  farooq: 'பாரூக்',
  faruk: 'பாரூக்',
  farooque: 'பாரூக்',
  fazil: 'பாசில்',
  habeeb: 'ஹபீப்',
  habib: 'ஹபீப்',
  haroon: 'ஹாரூன்',
  kamal: 'கமல்',
  khader: 'காதர்',
  kader: 'காதர்',
  kaader: 'காதர்',
  khaleel: 'கலீல்',
  khalil: 'கலீல்',
  mansoor: 'மன்சூர்',
  mansur: 'மன்சூர்',
  mustafa: 'முஸ்தபா',
  musthafa: 'முஸ்தபா',
  nasser: 'நாசர்',
  nasar: 'நாசர்',
  nazar: 'நாசர்',
  nawaz: 'நவாஸ்',
  noor: 'நூர்',
  rafiq: 'ரஃபீக்',
  rafeeq: 'ரஃபீக்',
  rafi: 'ரஃபி',
  rafee: 'ரஃபி',
  rasheed: 'ரஷீத்',
  rashid: 'ரஷீத்',
  sadik: 'சாதிக்',
  sadiq: 'சாதிக்',
  saeed: 'சயீத்',
  sayeed: 'சயீத்',
  saleem: 'சலீம்',
  salim: 'சலீம்',
  salman: 'சல்மான்',
  sarwar: 'சர்வார்',
  shahul: 'ஷாஹுல்',
  shaahul: 'ஷாஹுல்',
  siddiq: 'சித்திக்',
  siddique: 'சித்திக்',
  sikandar: 'சிக்கந்தர்',
  sikander: 'சிக்கந்தர்',
  siraj: 'சிராஜ்',
  siraaj: 'சிராஜ்',
  umar: 'உமர்',
  omar: 'உமர்',
  usman: 'உஸ்மான்',
  uthman: 'உஸ்மான்',
  osman: 'உஸ்மான்',
  yasin: 'யாசின்',
  yaseen: 'யாசின்',
  zakir: 'ஜாகிர்',
  hassan: 'ஹசன்',
  hasan: 'ஹசன்',
  hussain: 'ஹுசைன்',
  hussein: 'ஹுசைன்',
  anwar: 'அன்வர்',
  asif: 'ஆசிப்',
  arif: 'ஆரிப்',
  akbar: 'அக்பர்',
  rawther: 'ராவுத்தர்',
  marakkar: 'மரைக்காயர்',
  marakkayar: 'மரைக்காயர்',
  maraikayar: 'மரைக்காயர்',
  lebbai: 'லெப்பை',
  shah: 'ஷா',
  tajudeen: 'தாஜுதீன்',
  salahudeen: 'சலாஹுதீன்',
  sulaiman: 'சுலைமான்',
  suleman: 'சுலைமான்',
  mohideen: 'முஹைதீன்',
  muhaideen: 'முஹைதீன்',
  mydeen: 'மைதீன்',
  kasim: 'காசிம்',
  qasim: 'காசிம்',
  gani: 'கனி',
  badusha: 'பாதுஷா',
  jameel: 'ஜமீல்',
  shakil: 'ஷகீல்',
  altaf: 'அல்தாப்',
  tanveer: 'தன்வீர்',
  zameer: 'ஜமீர்',
  mahmood: 'மஹ்மூத்',
  masood: 'மசூத்',
  azhar: 'அசார்',
  nafees: 'நபீஸ்',
  rizwan: 'ரிஸ்வான்',
  irfan: 'இர்பான்',
  imran: 'இம்ரான்',
  faizal: 'பைசல்',
  faisal: 'பைசல்',
  shafi: 'ஷாஃபி',
  mubarak: 'முபாரக்',
  abu: 'அபூ',
  bakr: 'பக்கர்',
  abubakr: 'அபூபக்கர்',
  khan: 'கான்',
  ansari: 'அன்சாரி',
  king: 'கிங்',

  // Full name phrases
  'nasrin banu': 'நஸ்ரின் பானு',
  'nasreen banu': 'நஸ்ரீன் பானு',

  // Common Tamil Names
  manivel: 'மணிவேல்',
  kumar: 'குமார்',
  karthik: 'கார்த்திக்',
  karthick: 'கார்த்திக்',
  senthil: 'செந்தில்',
  murugan: 'முருகன்',
  priya: 'பிரியா',
  anitha: 'அனிதா',
  kavitha: 'கவிதா',
  selvam: 'செல்வம்',
  subramanian: 'சுப்ரமணியன்',
  ganesh: 'கணேஷ்',
  suresh: 'சுரேஷ்',
  ramesh: 'ரமேஷ்',
  vijay: 'விஜய்',
  ajith: 'அஜித்',
  surya: 'சூர்யா',
};

export const nameDictionaryTaToEn = {
  // Full name phrases
  'நஸ்ரின் பானு': 'Nasrin Banu',
  'நஸ்ரீன் பானு': 'Nasreen Banu',

  // Female Names
  'நஸ்ரின்': 'Nasrin',
  'நஸ்ரீன்': 'Nasreen',
  'பானு': 'Banu',
  'பர்வீன்': 'Parveen',
  'யாஸ்மின்': 'Yasmin',
  'தஸ்னீம்': 'Tasneem',
  'சமீரா': 'Sameera',
  'ஷமீம்': 'Shameem',
  'ஷபானா': 'Shabana',
  'ஷப்னம்': 'Shabnam',
  'ஷெரின்': 'Shereen',
  'சல்மா': 'Salma',
  'சுமையா': 'Sumaiya',
  'பாத்திமா': 'Fatima',
  'ஆயிஷா': 'Ayesha',
  'பீவி': 'Beevi',
  'பேகம்': 'Begum',
  'காத்தூன்': 'Khatoon',
  'நிஷா': 'Nisha',
  'சுல்தானா': 'Sultana',
  'சபியா': 'Safiya',
  'அப்ரீன்': 'Afreen',
  'ருபீனா': 'Rubina',
  'பிர்தௌஸ்': 'Firdous',
  'சோயா': 'Zoya',
  'ஆமினா': 'Amina',
  'கதீஜா': 'Khadija',
  'சனா': 'Sana',
  'ஹீனா': 'Heena',
  'ரிஹானா': 'Rihana',
  'ரெஹானா': 'Rehana',
  'ரஸியா': 'Raziya',
  'ரோஷ்னி': 'Roshni',
  'ரோஷன்': 'Roshan',
  'பெனாசிர்': 'Benazir',
  'மும்தாஜ்': 'Mumtaz',
  'நூர்ஜஹான்': 'Noorjahan',
  'ஆசிபா': 'Asifa',
  'ஆரிபா': 'Arifa',
  'ஹபீபா': 'Habiba',
  'நசீரா': 'Nazira',
  'ஷகீலா': 'Shakila',
  'ஜமீலா': 'Jameela',
  'பர்சானா': 'Farzana',
  'பர்ஹானா': 'Farhana',
  'பரிதா': 'Farida',
  'ரஷீதா': 'Rashida',
  'வஹீதா': 'Waheeda',
  'சாஜிதா': 'Sajida',
  'மாஜிதா': 'Majida',
  'ஆபிதா': 'Abida',
  'ஜாஹிரா': 'Zahira',
  'தாஹிரா': 'Tahira',
  'தபஸ்சும்': 'Tabassum',
  'முபீனா': 'Mubeena',
  'சபிரா': 'Sabira',
  'ஷாஹீன்': 'Shaheen',
  'ஷாஹிதா': 'Shahida',
  'பைசா': 'Faiza',
  'ஹப்ஸா': 'Hafsa',
  'மர்யம்': 'Mariam',
  'ஜைனப்': 'Zainab',
  'அஸ்மா': 'Asma',
  'சையதா': 'Syeda',

  // Male Names
  'ராஜா': 'Raja',
  'ஜான்': 'John',
  'முகமது': 'Mohamed',
  'முஹம்மது': 'Mohamed',
  'அலி': 'Ali',
  'அப்துல்': 'Abdul',
  'ரஹ்மான்': 'Rahman',
  'ரஹீம்': 'Rahim',
  'கரீம்': 'Karim',
  'சையத்': 'Syed',
  'பிலால்': 'Bilal',
  'இப்ராஹிம்': 'Ibrahim',
  'இஸ்மாயில்': 'Ismail',
  'இஸ்ஹாக்': 'Ishaq',
  'யூசுப்': 'Yusuf',
  'அஹ்மத்': 'Ahmed',
  'அர்ஷத்': 'Arshath',
  'சுல்தான்': 'Sultan',
  'ஹமீது': 'Hameed',
  'ஷேக்': 'Sheik',
  'தாவூத்': 'Dawood',
  'ஜாஃபர்': 'Jaffer',
  'சமீர்': 'Sameer',
  'சுபைர்': 'Zubair',
  'ஜுபைர்': 'Zubair',
  'ரியாஸ்': 'Riyaz',
  'அஸ்லம்': 'Aslam',
  'தாரிக்': 'Tariq',
  'பாரூக்': 'Farooq',
  'பாசில்': 'Fazil',
  'ஹபீப்': 'Habib',
  'ஹாரூன்': 'Haroon',
  'கமல்': 'Kamal',
  'காதர்': 'Khader',
  'கலீல்': 'Khaleel',
  'மன்சூர்': 'Mansoor',
  'முஸ்தபா': 'Mustafa',
  'நாசர்': 'Nasar',
  'நவாஸ்': 'Nawaz',
  'நூர்': 'Noor',
  'ரஃபீக்': 'Rafiq',
  'ரஃபி': 'Rafi',
  'ரஷீத்': 'Rasheed',
  'சாதிக்': 'Sadiq',
  'சயீத்': 'Saeed',
  'சலீம்': 'Salim',
  'சல்மான்': 'Salman',
  'சர்வார்': 'Sarwar',
  'ஷாஹுல்': 'Shahul',
  'சித்திக்': 'Siddiq',
  'சிக்கந்தர்': 'Sikandar',
  'சிராஜ்': 'Siraj',
  'சுலைமான்': 'Sulaiman',
  'உமர்': 'Umar',
  'உஸ்மான்': 'Usman',
  'யாசின்': 'Yaseen',
  'ஜாகிர்': 'Zakir',
  'ஹசன்': 'Hassan',
  'ஹுசைன்': 'Hussain',
  'அன்வர்': 'Anwar',
  'ஆசிப்': 'Asif',
  'ஆரிப்': 'Arif',
  'அக்பர்': 'Akbar',
  'ராவுத்தர்': 'Rawther',
  'மரைக்காயர்': 'Marakkayar',
  'லெப்பை': 'Lebbai',
  'ஷா': 'Shah',
  'தாஜுதீன்': 'Tajudeen',
  'சலாஹுதீன்': 'Salahudeen',
  'முஹைதீன்': 'Mohideen',
  'மைதீன்': 'Mydeen',
  'காசிம்': 'Kasim',
  'கனி': 'Gani',
  'பாதுஷா': 'Badusha',
  'ஜமீல்': 'Jameel',
  'ஷகீல்': 'Shakil',
  'அல்தாப்': 'Altaf',
  'தன்வீர்': 'Tanveer',
  'ஜமீர்': 'Zameer',
  'மஹ்மூத்': 'Mahmood',
  'மசூத்': 'Masood',
  'அசார்': 'Azhar',
  'நபீஸ்': 'Nafees',
  'ரிஸ்வான்': 'Rizwan',
  'இர்பான்': 'Irfan',
  'இம்ரான்': 'Imran',
  'பைசல்': 'Faizal',
  'ஷாஃபி': 'Shafi',
  'முபாரக்': 'Mubarak',
  'அபூ': 'Abu',
  'பக்கர்': 'Bakr',
  'அபூபக்கர்': 'Abu Bakr',
  'கான்': 'Khan',
  'அன்சாரி': 'Ansari',
  'கிங்': 'King',

  // Tamil Names
  'மணிவேல்': 'Manivel',
  'குமார்': 'Kumar',
  'கார்த்திக்': 'Karthik',
  'செந்தில்': 'Senthil',
  'முருகன்': 'Murugan',
  'பிரியா': 'Priya',
  'அனிதா': 'Anitha',
  'கவிதா': 'Kavitha',
  'செல்வம்': 'Selvam',
  'சுப்ரமணியன்': 'Subramanian',
  'கணேஷ்': 'Ganesh',
  'சுரேஷ்': 'Suresh',
  'ரமேஷ்': 'Ramesh',
  'விஜய்': 'Vijay',
  'அஜித்': 'Ajith',
  'சூர்யா': 'Surya',
};

export const initialMapEnToTa = {
  m: 'எம்',
  a: 'ஏ',
  s: 'எஸ்',
  k: 'கே',
  r: 'ஆர்',
  n: 'என்',
  t: 'டி',
  b: 'பி',
  j: 'ஜே',
  p: 'பி',
  d: 'டி',
  v: 'வி',
  g: 'ஜி',
  h: 'ஹெச்',
  c: 'சி',
  i: 'ஐ',
  z: 'இசட்',
};

export const initialMapTaToEn = {
  'எம்': 'M',
  'ஏ': 'A',
  'எஸ்': 'S',
  'கே': 'K',
  'ஆர்': 'R',
  'என்': 'N',
  'டி': 'T',
  'பி': 'B',
  'ஜே': 'J',
  'வி': 'V',
  'ஜி': 'G',
  'ஹெச்': 'H',
  'சி': 'C',
  'ஐ': 'I',
  'இசட்': 'Z',
};

const wordDictionary = {
  ...nameDictionaryEnToTa,
  chennai: 'சென்னை',
  madurai: 'மதுரை',
  coimbatore: 'கோயம்புத்தூர்',
  kovai: 'கோவை',
  trichy: 'திருச்சிராப்பள்ளி',
  tiruchirappalli: 'திருச்சிராப்பள்ளி',
  salem: 'சேலம்',
  tirunelveli: 'திருநெல்வேலி',
  vellore: 'வேலூர்',
  thanjavur: 'தஞ்சாவூர்',
  ramanathapuram: 'ராமநாதபுரம்',
  cuddalore: 'கடலூர்',
  dindigul: 'திண்டுக்கல்',
  erode: 'ஈரோடு',
  kanchipuram: 'காஞ்சிபுரம்',
  kanyakumari: 'கன்னியாகுமரி',
  karur: 'கரூர்',
  krishnagiri: 'கிருஷ்ணகிரி',
  nagapattinam: 'நாகப்பட்டினம்',
  namakkal: 'நாமக்கல்',
  pudukkottai: 'புதுக்கோட்டை',
  sivaganga: 'சிவகங்கை',
  theni: 'தேனி',
  thoothukudi: 'தூத்துக்குடி',
  tiruppur: 'திருப்பூர்',
  tiruvallur: 'திருவள்ளூர்',
  tiruvannamalai: 'திருவண்ணாமலை',
  tiruvarur: 'திருவாரூர்',
  viluppuram: 'விழுப்புரம்',
  virudhunagar: 'விருதுநகர்',
  nilgiris: 'நீலகிரி',
  ooty: 'ஊட்டி',
  vanakkam: 'வணக்கம்',
  doctor: 'மருத்துவர்',
  engineer: 'பொறியாளர்',
  teacher: 'ஆசிரியர்',
  business: 'வியாபாரம்',
  private: 'தனியார் பணி',
  software: 'மென்பொருள் பொறியாளர்',
  manager: 'மேலாளர்',
};

// Vowels
const vowels = {
  a: 'அ',
  aa: 'ஆ',
  A: 'ஆ',
  i: 'இ',
  ee: 'ஈ',
  I: 'ஈ',
  u: 'உ',
  oo: 'ஊ',
  U: 'ஊ',
  e: 'எ',
  E: 'ஏ',
  ae: 'ஏ',
  ai: 'ஐ',
  o: 'ஒ',
  O: 'ஓ',
  au: 'ஔ',
  ou: 'ஔ',
  q: 'ஃ',
  ak: 'ஃ',
};

// Vowel signs (Matras)
const matras = {
  a: '',
  aa: 'ா',
  A: 'ா',
  i: 'ி',
  ee: 'ீ',
  I: 'ீ',
  u: 'ு',
  oo: 'ூ',
  U: 'ூ',
  e: 'ெ',
  E: 'ே',
  ae: 'ே',
  ai: 'ை',
  o: 'ொ',
  O: 'ோ',
  au: 'ௌ',
  ou: 'ௌ',
};

// Base Consonants without pulli
// Note: Standard naming mappings (e.g. N -> ந, R -> ர, L -> ல, s before cons -> ஸ்)
const consonants = {
  k: 'க',
  g: 'க',
  kh: 'க',
  ng: 'ங',
  ch: 'ச',
  s: 'ச',
  c: 'ச',
  j: 'ஜ',
  nj: 'ஞ',
  gn: 'ஞ',
  t: 'ட',
  d: 'ட',
  th: 'த',
  dh: 'த',
  N: 'ந',  // Initial capital N in names is 'ந' (e.g. Nasrin -> நஸ்ரின், NOT ண)
  n: 'ந',  // Base 'ந' (handled contextually for final 'ன்' and middle 'ந்')
  nn: 'ண', // Double n produces 'ண'
  p: 'ப',
  b: 'ப',
  m: 'ம',
  y: 'ய',
  r: 'ர',
  R: 'ர',  // Capital R in names is 'ர' (e.g. Raja -> ராஜா, NOT ற)
  rr: 'ற',
  l: 'ல',
  L: 'ல',  // Capital L in names is 'ல' (e.g. Lalpet -> லால்பேட்டை, NOT ள)
  ll: 'ள',
  zh: 'ழ',
  z: 'ஜ',  // Default z in names is 'ஜ' (Zakir, Zainab); contextually 'ஸ்' at word end
  sh: 'ஷ',
  S: 'ஸ',
  h: 'ஹ',
  ksh: 'க்ஷ',
  f: 'ப',
  ph: 'ப',
};

// Tamil character code definitions for Tamil -> English
const T_VOWELS = {
  '\u0B85': 'a',
  '\u0B86': 'aa',
  '\u0B87': 'i',
  '\u0B88': 'ee',
  '\u0B89': 'u',
  '\u0B8A': 'oo',
  '\u0B8E': 'e',
  '\u0B8F': 'e',
  '\u0B90': 'ai',
  '\u0B92': 'o',
  '\u0B93': 'o',
  '\u0B94': 'au',
  '\u0B83': 'h',
};

const T_CONSONANTS = {
  '\u0B95': 'k',
  '\u0B99': 'ng',
  '\u0B9A': 's',
  '\u0B9E': 'gn',
  '\u0B9F': 't',
  '\u0BA3': 'n',
  '\u0BA4': 'th',
  '\u0BA8': 'n',
  '\u0BAA': 'p',
  '\u0BAE': 'm',
  '\u0BAF': 'y',
  '\u0BB0': 'r',
  '\u0BB2': 'l',
  '\u0BB5': 'v',
  '\u0BB4': 'zh',
  '\u0BB3': 'l',
  '\u0BB1': 'r',
  '\u0BA9': 'n',
  '\u0B9C': 'j',
  '\u0BB7': 'sh',
  '\u0BB8': 's',
  '\u0BB9': 'h',
};

const T_MATRAS = {
  '\u0BBE': 'a',
  '\u0BBF': 'i',
  '\u0BC0': 'ee',
  '\u0BC1': 'u',
  '\u0BC2': 'oo',
  '\u0BC6': 'e',
  '\u0BC7': 'e',
  '\u0BC8': 'ai',
  '\u0BCA': 'o',
  '\u0BCB': 'o',
  '\u0BCC': 'au',
};

const PULLI = '\u0BCD';

const isVowelChar = (c) => ['a', 'e', 'i', 'o', 'u'].includes((c || '').toLowerCase());

/**
 * Transliterate phonetic English word to authentic Tamil script
 */
export const transliterateWord = (word) => {
  if (!word) return '';
  const lower = word.toLowerCase();

  // Check single letter initials (e.g. M, M., A, A.)
  const cleanInitial = lower.replace(/\./g, '');
  if (word.length <= 2 && initialMapEnToTa[cleanInitial]) {
    const hasDot = word.includes('.');
    return initialMapEnToTa[cleanInitial] + (hasDot ? '.' : '');
  }

  // 1. Direct dictionary check (handles high accuracy for real names)
  if (wordDictionary[lower]) {
    return wordDictionary[lower];
  }

  let result = '';
  let i = 0;
  const len = word.length;

  while (i < len) {
    const one = word.charAt(i);
    const oneLower = one.toLowerCase();
    const two = word.substr(i, 2).toLowerCase();
    const three = word.substr(i, 3).toLowerCase();
    const next1 = i + 1 < len ? word.charAt(i + 1).toLowerCase() : '';
    const isAtWordEnd = (i + 1 >= len);

    // Rule A: 's' followed by another consonant (e.g. 'sr' in nasrin, 'lm' in aslam, 'm' in ismail, 't' in mustafa)
    // or 's' at the end of word (e.g. 'riyas', 'ilyas'):
    // MUST be 'ஸ்' (Grantha 'ஸ்'), NEVER 'ச்' ('நச்ரிந்' is wrong, 'நஸ்ரின்' is correct!)
    if (oneLower === 's' && two !== 'sh') {
      if (isAtWordEnd || !isVowelChar(next1)) {
        result += 'ஸ்';
        i += 1;
        continue;
      }
    }

    // Rule B: 'z' in names:
    // If at start of word followed by vowel: 'ஜ' (Zakir, Zainab, Zameer)
    // If at end of word or before consonant: 'ஸ்' (Riyaz, Nawaz, Aziz)
    if (oneLower === 'z' && two !== 'zh') {
      if (i === 0 && isVowelChar(next1)) {
        // start of word -> 'ஜ'
        i += 1;
        const nextVowel2 = word.substr(i, 2).toLowerCase();
        const nextVowel1 = word.substr(i, 1).toLowerCase();
        if (matras[nextVowel2] !== undefined) {
          result += 'ஜ' + matras[nextVowel2];
          i += 2;
        } else if (matras[nextVowel1] !== undefined) {
          result += 'ஜ' + matras[nextVowel1];
          i += 1;
        } else {
          result += 'ஜ';
        }
        continue;
      } else {
        // end or middle before consonant -> 'ஸ்'
        result += 'ஸ்';
        i += 1;
        continue;
      }
    }

    // Rule C: 'n' at the end of word (e.g. nasrin, salman, rahman, irfan, john):
    // MUST be 'ன்' (தன்னகரம் 'ன்'), NEVER 'ந்' or 'ண' ('நச்ரிந்' is wrong, 'நஸ்ரின்' is correct!)
    if (oneLower === 'n' && isAtWordEnd) {
      result += 'ன்';
      i += 1;
      continue;
    }

    // Rule D: 'n' followed by dental stop 't' or 'th' or 'd' (e.g. santhanam, senthil, anand):
    // MUST be 'ந்'
    if (oneLower === 'n' && (two === 'nt' || three.startsWith('nth') || two === 'nd')) {
      result += 'ந்';
      i += 1;
      continue;
    }

    // Rule E: 't' at the beginning of names/words followed by vowel: 'த' (e.g. Tariq -> தாரிக், Tajudeen -> தாஜுதீன்)
    if (i === 0 && oneLower === 't' && two !== 'th' && isVowelChar(next1)) {
      i += 1;
      const nextVowel2 = word.substr(i, 2).toLowerCase();
      const nextVowel1 = word.substr(i, 1).toLowerCase();
      if (matras[nextVowel2] !== undefined) {
        result += 'த' + matras[nextVowel2];
        i += 2;
      } else if (matras[nextVowel1] !== undefined) {
        result += 'த' + matras[nextVowel1];
        i += 1;
      } else {
        result += 'த';
      }
      continue;
    }

    // Check 3-letter, 2-letter, 1-letter consonant combinations
    let matchedConsonant = null;
    let consLen = 0;

    if (consonants[three]) {
      matchedConsonant = consonants[three];
      consLen = 3;
    } else if (consonants[two]) {
      matchedConsonant = consonants[two];
      consLen = 2;
    } else if (consonants[one] || consonants[oneLower]) {
      matchedConsonant = consonants[one] || consonants[oneLower];
      consLen = 1;
    }

    if (matchedConsonant) {
      i += consLen;
      // Look for following vowel
      const nextTwo = word.substr(i, 2).toLowerCase();
      const nextOne = word.substr(i, 1).toLowerCase();

      if (i < len && matras[nextTwo] !== undefined) {
        result += matchedConsonant + matras[nextTwo];
        i += 2;
      } else if (i < len && matras[nextOne] !== undefined) {
        result += matchedConsonant + matras[nextOne];
        i += 1;
      } else {
        // Pure consonant with pulli
        result += matchedConsonant + '்';
      }
      continue;
    }

    // Check standalone vowel
    if (vowels[two]) {
      result += vowels[two];
      i += 2;
      continue;
    }

    if (vowels[one] || vowels[oneLower]) {
      result += vowels[one] || vowels[oneLower];
      i += 1;
      continue;
    }

    // Non-alphabet or punctuation
    result += one;
    i++;
  }

  return result;
};

/**
 * Transliterate complete sentence or phrase (English -> Tamil)
 */
export const transliterateSentence = (text) => {
  if (!text) return '';
  const parts = text.split(/(\s+|\.)/);
  return parts
    .map((part) => {
      if (!part || /^[\s.]+$/.test(part)) return part;
      return transliterateWord(part);
    })
    .join('');
};

/**
 * Phonetically convert Tamil word to natural English
 */
export const tamilToEnglishWord = (word) => {
  if (!word) return '';

  // Direct reverse dictionary check
  if (nameDictionaryTaToEn[word]) {
    return nameDictionaryTaToEn[word];
  }

  // Check Tamil initials (e.g. 'எம்.' -> 'M.')
  const cleanInitial = word.replace(/\./g, '');
  if (initialMapTaToEn[cleanInitial]) {
    const hasDot = word.includes('.');
    return initialMapTaToEn[cleanInitial] + (hasDot ? '.' : '');
  }

  let res = '';
  let i = 0;
  while (i < word.length) {
    const ch = word[i];
    if (T_VOWELS[ch]) {
      res += T_VOWELS[ch];
      i++;
    } else if (T_CONSONANTS[ch]) {
      let cons = T_CONSONANTS[ch];
      const next = word[i + 1];
      if (next === PULLI) {
        res += cons;
        i += 2;
      } else if (next && T_MATRAS[next]) {
        res += cons + T_MATRAS[next];
        i += 2;
      } else {
        res += cons + 'a';
        i += 1;
      }
    } else {
      res += ch;
      i++;
    }
  }

  if (!res) return '';
  // Cleanup natural phonetic combinations: e.g. thth -> th
  res = res.replace(/thth/g, 'th');
  return res.charAt(0).toUpperCase() + res.slice(1);
};

/**
 * Transliterate complete phrase or name (Tamil -> English)
 */
export const transliterateTamilToEnglish = (text) => {
  if (!text) return '';
  if (nameDictionaryTaToEn[text]) {
    return nameDictionaryTaToEn[text];
  }
  const parts = text.split(/(\s+|\.)/);
  return parts
    .map((part) => {
      if (!part || /^[\s.]+$/.test(part)) return part;
      return tamilToEnglishWord(part);
    })
    .join('');
};

/**
 * Transliterate complete phrase or name (English -> Tamil)
 */
export const transliterateEnglishToTamil = (text) => {
  if (!text) return '';
  const lowerWhole = text.toLowerCase();
  if (nameDictionaryEnToTa[lowerWhole]) {
    return nameDictionaryEnToTa[lowerWhole];
  }
  const parts = text.split(/(\s+|\.)/);
  return parts
    .map((part) => {
      if (!part || /^[\s.]+$/.test(part)) return part;
      const lower = part.toLowerCase();
      if (nameDictionaryEnToTa[lower]) {
        return nameDictionaryEnToTa[lower];
      }
      return transliterateWord(part);
    })
    .join('');
};

/**
 * Intelligent Bidirectional Name Transliterator:
 * - If targetLang is 'ta' and name is English: transliterates to authentic Tamil script
 *   (e.g. 'Nasrin Banu' -> 'நஸ்ரின் பானு', 'Raja' -> 'ராஜா', 'King' -> 'கிங்')
 * - If targetLang is 'en' and name is Tamil: transliterates to English
 *   (e.g. 'நஸ்ரின் பானு' -> 'Nasrin Banu', 'ராஜா' -> 'Raja')
 * - Strictly avoids literal word translations ('Raja' never becomes 'King', 'King' never becomes 'அரசன்').
 * - Preserves leading and trailing whitespace for smooth live typing between inputs.
 */
export const transliterateName = (name, targetLang = 'ta') => {
  if (!name || typeof name !== 'string') return name || '';
  if (!name.trim()) return name;

  const match = name.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const leadingSpace = match ? match[1] : '';
  const core = match ? match[2] : name;
  const trailingSpace = match ? match[3] : '';

  const hasTamil = /[\u0B80-\u0BFF]/.test(core);

  let result = core;
  if (targetLang === 'ta') {
    // Already in Tamil
    if (!hasTamil) {
      result = transliterateEnglishToTamil(core);
    }
  } else {
    // English target
    if (hasTamil) {
      result = transliterateTamilToEnglish(core);
    }
  }

  return leadingSpace + result + trailingSpace;
};
