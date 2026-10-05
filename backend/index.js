// Cloud Functions entry point. Firebase Hosting rewrites /api/** and /uploads/** to `matrimonyApi`
// (see ../firebase.json), so the frontend keeps using relative URLs.
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import app from './app.js';

const secrets = [
  'JWT_SECRET',
  'ADMIN_SECRET_KEY',
  'ADMIN_PASSWORD',
  'SUPERADMIN_PASSWORD',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  // Add 'SMTP_PASS' here (and set SMTP_HOST/SMTP_USER in .env.<project>) once a real
  // mail provider is configured; until then emails are only logged.
].map((name) => defineSecret(name));

export const matrimonyApi = onRequest(
  {
    region: 'asia-south1',
    memory: '512MiB',
    timeoutSeconds: 120,
    maxInstances: 10,
    secrets,
  },
  app
);
