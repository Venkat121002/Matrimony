import crypto from 'crypto';

/**
 * Zoho Payments (India) — server side.
 *
 *   ZOHO_ACCOUNT_ID             Zoho Payments account id (Settings URL: payments.zoho.in/app/<id>)
 *   ZOHO_API_KEY                public widget key (Developer Space > Authentication Keys), sent to browsers
 *   ZOHO_CLIENT_ID              OAuth client (api-console.zoho.in)
 *   ZOHO_CLIENT_SECRET          secret
 *   ZOHO_REFRESH_TOKEN          secret; scopes ZohoPay.payments.CREATE,ZohoPay.payments.READ
 *   ZOHO_WEBHOOK_SIGNING_KEY    secret; Developer Space > Webhooks > signing key
 *
 * Docs: https://www.zoho.com/in/payments/api/v1/payment-session/
 */

const API_BASE = 'https://payments.zoho.in/api/v1';
const TOKEN_URL = 'https://accounts.zoho.in/oauth/v2/token';

const env = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Zoho Payments is not configured: ${name} is missing`);
  return value;
};

export const isZohoConfigured = () =>
  ['ZOHO_ACCOUNT_ID', 'ZOHO_API_KEY', 'ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN'].every(
    (n) => process.env[n]
  );

// What the browser needs to open the checkout widget (all public values).
export const widgetConfig = () => ({ accountId: env('ZOHO_ACCOUNT_ID'), apiKey: env('ZOHO_API_KEY') });

// Access tokens live ~1 hour; cache per instance and refresh a minute early.
let cachedToken = null;
let cachedUntil = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < cachedUntil) return cachedToken;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: env('ZOHO_REFRESH_TOKEN'),
    client_id: env('ZOHO_CLIENT_ID'),
    client_secret: env('ZOHO_CLIENT_SECRET'),
  });
  const res = await fetch(TOKEN_URL, { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`Zoho OAuth refresh failed: ${data.error || res.status}`);
  }
  cachedToken = data.access_token;
  cachedUntil = Date.now() + (Number(data.expires_in || 3600) - 60) * 1000;
  return cachedToken;
};

const zohoRequest = async (method, path, body) => {
  const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}account_id=${encodeURIComponent(env('ZOHO_ACCOUNT_ID'))}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${await getAccessToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.code !== undefined && data.code !== 0)) {
    const err = new Error(`Zoho Payments ${method} ${path} failed: ${data.message || res.status}`);
    err.zoho = data;
    throw err;
  }
  return data;
};

/**
 * Create a payment session. `amountInRupees` is a number like 999 or 199.5.
 * Returns { payments_session_id, amount, expiry_time, ... }.
 */
export const createPaymentSession = async ({ amountInRupees, description, referenceNumber, metaData = {} }) => {
  const data = await zohoRequest('POST', '/paymentsessions', {
    amount: Number(amountInRupees.toFixed(2)),
    currency: 'INR',
    description: String(description).slice(0, 500),
    reference_number: String(referenceNumber).slice(0, 50),
    meta_data: Object.entries(metaData)
      .slice(0, 5)
      .map(([key, value]) => ({ key: key.slice(0, 20), value: String(value).slice(0, 500) })),
  });
  return data.payments_session;
};

// Authoritative status of a session: { status, amount, payments: [{ payment_id, status }] }.
export const getPaymentSession = async (sessionId) => {
  const data = await zohoRequest('GET', `/paymentsessions/${encodeURIComponent(sessionId)}`);
  return data.payments_session;
};

// The succeeded payment of a session, or null.
export const succeededPayment = (session) =>
  (session?.payments || []).find((p) => p.status === 'succeeded') || null;

/**
 * Verify X-Zoho-Webhook-Signature ("t=<ms>,v=<hex hmac>"): HMAC-SHA256 of "<t>.<raw body>"
 * with the webhook signing key. Rejects signatures older than `toleranceMs` (replays).
 */
export const verifyWebhookSignature = (rawBody, header, { toleranceMs = 15 * 60 * 1000 } = {}) => {
  const key = process.env.ZOHO_WEBHOOK_SIGNING_KEY;
  if (!key || !header || !rawBody) return false;
  const parts = Object.fromEntries(
    String(header)
      .split(',')
      .map((kv) => kv.trim().split('='))
      .filter((kv) => kv.length === 2)
  );
  const { t, v } = parts;
  if (!t || !v || !/^[0-9a-f]+$/i.test(v)) return false;
  if (toleranceMs && Math.abs(Date.now() - Number(t)) > toleranceMs) return false;

  const expected = crypto
    .createHmac('sha256', key)
    .update(`${t}.`)
    .update(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody)))
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(v, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
