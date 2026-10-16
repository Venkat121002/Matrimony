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
  async stream(folder, filename, res, headers = {}, req = null) {
    const name = safeName(filename);
    const filePath = path.join(uploadsRoot, folder, name);
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    const totalSize = stat.size;
    const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);

    const range = req?.headers?.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${totalSize}`);
        res.end();
        return true;
      }
      const chunkSize = end - start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.setHeader('Content-Length', chunkSize);
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath, { start, end }).on('error', reject).on('end', resolve).pipe(res);
      });
      return true;
    } else {
      res.setHeader('Content-Length', totalSize);
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath).on('error', reject).on('end', resolve).pipe(res);
      });
      return true;
    }
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
    async stream(folder, filename, res, headers = {}, req = null) {
      const file = object(folder, filename);
      const [exists] = await file.exists();
      if (!exists) return false;
      const [meta] = await file.getMetadata();
      const totalSize = parseInt(meta.size, 10);
      const contentType = meta.contentType || CONTENT_TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);

      const range = req?.headers?.range;
      if (range && Number.isFinite(totalSize)) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
          res.status(416).setHeader('Content-Range', `bytes */${totalSize}`);
          res.end();
          return true;
        }
        const chunkSize = end - start + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Content-Length', chunkSize);
        await new Promise((resolve, reject) => {
          file.createReadStream({ start, end }).on('error', reject).on('end', resolve).pipe(res);
        });
        return true;
      } else {
        if (Number.isFinite(totalSize)) {
          res.setHeader('Content-Length', totalSize);
        }
        await new Promise((resolve, reject) => {
          file.createReadStream().on('error', reject).on('end', resolve).pipe(res);
        });
        return true;
      }
    },
    async remove(folder, filename) {
      await object(folder, filename).delete({ ignoreNotFound: true });
    },
  };
};

const driver = isFirestore ? await firebaseDriver() : localDriver;

export const saveFile = (folder, filename, buffer, contentType) => driver.save(folder, filename, buffer, contentType);

// Stream a stored file to the response; resolves false if it does not exist.
export const streamFile = (folder, filename, res, headers = {}, req = null) => driver.stream(folder, filename, res, headers, req);

export const deleteFile = (folder, filename) => driver.remove(folder, filename);
