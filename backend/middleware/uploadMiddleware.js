import multer from 'multer';
import path from 'path';
import { Readable } from 'stream';
import { saveFile, streamFile, deleteFile } from '../services/fileStorage.js';

/**
 * Uploads are buffered in memory by multer, then handed to services/fileStorage.js
 * (Cloud Storage in production, backend/uploads/ locally):
 *   media/<file>  -> public photos / audio clips, served at /uploads/media/<file>
 *   kyc/<file>    -> private identity documents, only streamed to admins
 */

// Cloud Functions has already read the request body into req.rawBody, so multer's
// req.pipe() would see an empty stream. Re-feed it from the buffered body.
const rawBodyShim = (req, res, next) => {
  if (req.rawBody && req.readableEnded) {
    const stream = Readable.from(req.rawBody);
    req.pipe = stream.pipe.bind(stream);
    req.unpipe = stream.unpipe.bind(stream);
  }
  next();
};

const uniqueSuffix = () => `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const kycFilename = (file) => `kyc-${uniqueSuffix()}${path.extname(file.originalname || '').toLowerCase()}`;

const mediaFilename = (file) => {
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
  return `${prefix}-${uniqueSuffix()}${ext}`;
};

const saveToStorage = async (folder, file, filename) => {
  await saveFile(folder, filename, file.buffer, file.mimetype);
  file.filename = filename;
  delete file.buffer;
};

// After multer: persist every received file and expose `file.filename` like diskStorage did.
const persist = (folder, nameFor) => async (req, res, next) => {
  try {
    const files = req.file ? [req.file] : Object.values(req.files || {}).flat();
    await Promise.all(
      files.map((f) => saveToStorage(f.fieldname === 'kycDocument' ? 'kyc' : folder, f, (f.fieldname === 'kycDocument' ? kycFilename : nameFor)(f)))
    );
    next();
  } catch (err) {
    next(err);
  }
};

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
  const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif'];
  const allowedAudioExts = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.amr', '.3gp', '.mp4', '.flac', '.wma', '.opus'];

  const isImage = (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') || allowedImageExts.includes(ext);
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

// Cloud Functions caps request bodies at 32MB, so keep totals well under that.
export const uploadKYC = (fieldName) => [
  rawBodyShim,
  multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).single(fieldName),
  persist('kyc', kycFilename),
];

export const uploadMedia = [
  rawBodyShim,
  multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: mediaFilter }).fields([
    { name: 'photos', maxCount: 5 },
    { name: 'audioClip', maxCount: 1 },
    { name: 'kycDocument', maxCount: 1 },
  ]),
  persist('media', mediaFilename),
];

// Stream a stored file to the response; returns false if it does not exist.
export const streamStoredFile = (folder, filename, res, headers = {}) => streamFile(folder, filename, res, headers);

export const deleteStoredFile = (folder, filename) => deleteFile(folder, filename);
