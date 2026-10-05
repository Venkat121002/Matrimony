// Local development entry point: `npm run dev` / `npm start`.
// In production the same Express app runs as the `api` Cloud Function (see index.js).
// Local settings live in .env.local (Firebase only uses .env.local for the emulator,
// so local secrets are never uploaded with a deploy). Must load before app.js.
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config({ path: fileURLToPath(new URL('./.env.local', import.meta.url)) });
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Tamil Muslim Nikkah Server] Running on http://localhost:${PORT}`);
  console.log(`[API Endpoints] /api/auth, /api/profiles, /api/payment, /api/admin, /api/support`);
});
