/**
 * Database selection.
 *   DB_TYPE=mongodb   -> local development (MongoDB via MONGO_URI, uploads on local disk)
 *   DB_TYPE=firestore -> production on Firebase (Firestore + Cloud Storage)
 * Defaults to mongodb; the deployed function sets DB_TYPE=firestore in
 * .env.swordnex-client-server. Read at startup, so dotenv must load first (see server.js).
 */
export const DB_TYPE = (process.env.DB_TYPE || 'mongodb').toLowerCase();

if (!['mongodb', 'firestore'].includes(DB_TYPE)) {
  throw new Error(`Unsupported DB_TYPE "${DB_TYPE}" (use mongodb or firestore)`);
}

export const isFirestore = DB_TYPE === 'firestore';

// Connect MongoDB when it is the active database; Firestore needs no connection step.
export const connectDatabase = async () => {
  if (isFirestore) return;
  const { default: mongoose } = await import('mongoose');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tamil_nikah';
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};
