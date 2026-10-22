import { tenantAuth } from '../config/firebase.js';

/**
 * Member logins live in the Identity Platform tenant (AUTH_TENANT_ID), like the MeyyaKutty project.
 * Members still sign in with mobile number / Nikah ID / email: the server finds the member document
 * first, then checks the password against the tenant account stored in `authEmail`.
 * Members without a usable email get a hidden address such as 9876543210@matrimony.swordnex.in.
 */

export const tenantAuthEnabled = Boolean(tenantAuth);

const SYNTHETIC_DOMAIN = process.env.AUTH_SYNTHETIC_EMAIL_DOMAIN || 'matrimony.swordnex.in';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Addresses to try, in order, as the tenant login for a member: real email, phone, Nikah ID. */
export const authEmailCandidates = ({ email, phone, nikahId } = {}) => {
  const list = [];
  const real = String(email || '').trim().toLowerCase();
  if (EMAIL_RE.test(real)) list.push(real);
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits) list.push(`${digits}@${SYNTHETIC_DOMAIN}`);
  if (nikahId) list.push(`nikah${String(nikahId).replace(/\W/g, '')}@${SYNTHETIC_DOMAIN}`);
  return [...new Set(list)];
};

/** Create the tenant login, moving to the next candidate address if one is already taken. */
export const createTenantUser = async ({ candidates, password, displayName }) => {
  let lastError = new Error('No email address available to create a login.');
  for (const email of candidates) {
    try {
      const record = await tenantAuth.createUser({ email, password, displayName: displayName || undefined });
      return { uid: record.uid, email };
    } catch (err) {
      if (err.code !== 'auth/email-already-exists') throw err;
      lastError = err;
    }
  }
  throw lastError;
};

/** True when the password matches the tenant account; false for a wrong password / unknown account. */
export const verifyTenantPassword = async (email, password) => {
  const key = process.env.AUTH_WEB_API_KEY;
  if (!key) throw new Error('Server misconfigured: AUTH_WEB_API_KEY is not set');

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantId: process.env.AUTH_TENANT_ID, returnSecureToken: false }),
  });
  if (res.ok) return true;

  const code = String((await res.json().catch(() => ({})))?.error?.message || '');
  if (/^(INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_LOGIN_CREDENTIALS|USER_DISABLED)/.test(code)) return false;

  const err = new Error(code.startsWith('TOO_MANY_ATTEMPTS') ? 'Too many login attempts. Please try again later.' : `Sign-in service error: ${code || res.status}`);
  err.status = code.startsWith('TOO_MANY_ATTEMPTS') ? 429 : 502;
  throw err;
};

export const updateTenantPassword = (uid, password) => tenantAuth.updateUser(uid, { password });

export const deleteTenantUser = async (uid) => {
  try {
    await tenantAuth.deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') throw err;
  }
};
