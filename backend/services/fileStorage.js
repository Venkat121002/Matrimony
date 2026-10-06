import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isFirestore } from '../config/database.js';

/**
 * Where uploaded files live:
 *   production (DB_TYPE=firestore) -> Cloud Storage bucket, objects `media/<file>` / `kyc/<file>`
 *   local      (DB_TYPE=mongodb)   -> backend/uploads/media and backend/uploads/kyc on disk
 * `folder` is always 'media' (public photos/audio) or 'kyc' (private ID documents).
 */

const uploadsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.bmp': 'image/bmp', '.heic': 'image/heic', '.heif': 'image/heif',
  '.pdf': 'application/pdf', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.webm': 'audio/webm', '.mp4': 'audio/mp4',
  '.amr': 'audio/amr', '.3gp': 'audio/3gpp', '.flac': 'audio/flac', '.wma': 'audio/x-ms-wma',
};

const safeName = (filename) => path.basename(String(filename));

const localDriver = {
  async save(folder, filename, buffer) {
    const dir = path.join(uploadsRoot, folder);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(path.join(dir, safeName(filename)), buffer);
  },
  async stream(folder, filename, res, headers) {
    const name = safeName(filename);
    const filePath = path.join(uploadsRoot, folder, name);
    if (!fs.existsSync(filePath)) return false;
    res.setHeader('Content-Type', CONTENT_TYPES[path.extname(name).toLowerCase()] || 'application/octet-stream');
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath).on('error', reject).on('end', resolve).pipe(res);
    });
    return true;
  },
  async remove(folder, filename) {
    await fs.promises.rm(path.join(uploadsRoot, folder, safeName(filename)), { force: true });
  },
};

const firebaseDriver = async () => {
  const { bucket } = await import('../config/firebase.js');
  const object = (folder, filename) => bucket().file(`${folder}/${safeName(filename)}`);
  return {
    async save(folder, filename, buffer, contentType) {
      await object(folder, filename).save(buffer, { resumable: false, contentType: contentType || 'application/octet-stream' });
    },
    async stream(folder, filename, res, headers) {
      const file = object(folder, filename);
      const [exists] = await file.exists();
      if (!exists) return false;
      const [meta] = await file.getMetadata();
      res.setHeader('Content-Type', meta.contentType || 'application/octet-stream');
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
      await new Promise((resolve, reject) => {
        file.createReadStream().on('error', reject).on('end', resolve).pipe(res);
      });
      return true;
    },
    async remove(folder, filename) {
      await object(folder, filename).delete({ ignoreNotFound: true });
    },
  };
};

const driver = isFirestore ? await firebaseDriver() : localDriver;

export const saveFile = (folder, filename, buffer, contentType) => driver.save(folder, filename, buffer, contentType);

// Stream a stored file to the response; resolves false if it does not exist.
export const streamFile = (folder, filename, res, headers = {}) => driver.stream(folder, filename, res, headers);

export const deleteFile = (folder, filename) => driver.remove(folder, filename);
