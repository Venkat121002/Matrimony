import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Private secure upload directory (for legacy kyc if needed)
const uploadDir = path.resolve(__dirname, '../uploads/kyc');
const mediaDir = path.resolve(__dirname, '../uploads/media');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure randomized unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `kyc-${uniqueSuffix}${ext}`);
  },
});

const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext) {
      if (file.mimetype.includes('webm')) ext = '.webm';
      else if (file.mimetype.includes('wav')) ext = '.wav';
      else if (file.mimetype.includes('ogg')) ext = '.ogg';
      else if (file.mimetype.includes('m4a') || file.mimetype.includes('mp4')) ext = '.m4a';
      else if (file.fieldname === 'audioClip' || file.mimetype.startsWith('audio/')) ext = '.mp3';
      else if (file.mimetype.includes('png')) ext = '.png';
      else ext = '.jpg';
    }
    const prefix = file.fieldname === 'audioClip' ? 'audio' : 'photo';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF documents are allowed.'), false);
  }
};

const mediaFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif', '.svg'];
  const allowedAudioExts = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.amr', '.3gp', '.mp4', '.flac', '.wma', '.opus'];

  const isImage = file.mimetype.startsWith('image/') || allowedImageExts.includes(ext);
  const isAudio =
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('video/webm') ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'application/ogg' ||
    file.mimetype === 'application/octet-stream' ||
    allowedAudioExts.includes(ext);
  const isDoc = file.mimetype === 'application/pdf' || ext === '.pdf';

  if (isImage || isAudio || isDoc) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype || ext}. Allowed: Images (JPG, PNG, WEBP) and Audio (MP3, WAV, M4A, AAC, WEBM).`), false);
  }
};

export const uploadKYC = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

export const uploadMedia = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: mediaFilter,
}).fields([
  { name: 'photos', maxCount: 5 },
  { name: 'audioClip', maxCount: 1 },
  { name: 'kycDocument', maxCount: 1 },
]);

export const getPrivateKYCDir = () => uploadDir;
export const getMediaDir = () => mediaDir;

