import mongoose from 'mongoose';

const cleanupLegacyIndexes = async (conn) => {
  try {
    const collections = await conn.connection.db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      const usersCol = conn.connection.db.collection('users');
      const indexes = await usersCol.indexes();
      const hasUsernameIndex = indexes.some((idx) => idx.name === 'username_1');
      if (hasUsernameIndex) {
        await usersCol.dropIndex('username_1');
        console.log('[Database] Cleaned up legacy unique index: username_1');
      }
    }
  } catch (indexErr) {
    // Non-fatal warning
    console.warn('[Database] Index cleanup warning:', indexErr.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tamil_nikah';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    await cleanupLegacyIndexes(conn);
    return conn;
  } catch (err) {
    console.warn(`[Database] Primary MongoDB connection failed (${err.message}). Trying local MongoDB fallback...`);
    const localUri = 'mongodb://127.0.0.1:27017/tamil_nikah';
    if (uri !== localUri) {
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Connected to Local MongoDB: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.warn(`[Database] Local MongoDB not available (${localErr.message}). Starting in-memory MongoDB fallback...`);
      }
    }
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB running at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] Failed to connect to database: ${memErr.message}`);
      throw memErr;
    }
  }
};
