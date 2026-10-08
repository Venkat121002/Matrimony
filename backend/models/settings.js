// Picks the MongoDB (local) or Firestore (production) driver; see config/database.js.
import { isFirestore } from '../config/database.js';

const driver = await import(isFirestore ? './firestore/settings.js' : './mongo/settings.js');

export const { DEFAULT_SETTINGS, getSettings, updateSettings } = driver;
