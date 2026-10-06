// Local development entry point: `npm run dev` / `npm start`.
// Uses MongoDB + local disk uploads by default (DB_TYPE=mongodb in .env.local).
// In production the same Express app runs as the `matrimonyApi` Cloud Function with
// DB_TYPE=firestore (see index.js and .env.swordnex-client-server).
// Local settings live in .env.local (Firebase only uses .env.local for the emulator,
// so local secrets are never uploaded with a deploy). Must load before app.js.
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config({ path: fileURLToPath(new URL('./.env.local', import.meta.url)) });
const { default: app } = await import('./app.js');
const { DB_TYPE, connectDatabase } = await import('./config/database.js');

const PORT = process.env.PORT || 5000;

await connectDatabase();
console.log(`[Database] Mode: ${DB_TYPE}`);

app.listen(PORT, () => {
  console.log(`[Tamil Muslim Nikkah Server] Running on http://localhost:${PORT}`);
  console.log(`[API Endpoints] /api/auth, /api/profiles, /api/payment, /api/admin, /api/support`);
});
