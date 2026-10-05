/**
 * Secret lookups with development-only fallbacks.
 * In production (NODE_ENV=production) a missing secret is a hard error instead of
 * silently falling back to a value that is published in this repository.
 */
const isProd = () => process.env.NODE_ENV === 'production';

const required = (name, devFallback) => {
  const value = process.env[name];
  if (value) return value;
  if (isProd()) throw new Error(`Server misconfigured: ${name} is not set`);
  return devFallback;
};

export const getJwtSecret = () => required('JWT_SECRET', 'tamil_nikah_jwt_secret_key_2026');
export const getAdminSecretKey = () => required('ADMIN_SECRET_KEY', 'nikah-admin-secret-2026');
export const getAdminCreds = () => ({
  superUser: process.env.SUPERADMIN_USERNAME || 'superadmin',
  superPass: required('SUPERADMIN_PASSWORD', 'Admin@TamilNikah2026!'),
  adminUser: process.env.ADMIN_USERNAME || 'admin',
  adminPass: required('ADMIN_PASSWORD', 'Admin@TamilNikah2026!'),
});

// Demo payment shortcuts (fake orders / 'demo_verified_signature') only outside production.
export const allowDemoPayments = () => !isProd() || process.env.ALLOW_DEMO_PAYMENTS === 'true';
