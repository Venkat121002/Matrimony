// Zoho Payments flow test against local MongoDB with Zoho's HTTP API stubbed.
// Run from backend/: node test_zoho_payments.js
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('./.env.local', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });
Object.assign(process.env, {
  DB_TYPE: 'mongodb',
  ZOHO_ACCOUNT_ID: '60092805981',
  ZOHO_API_KEY: 'test-widget-key',
  ZOHO_CLIENT_ID: 'test-client',
  ZOHO_CLIENT_SECRET: 'test-secret',
  ZOHO_REFRESH_TOKEN: 'test-refresh',
  ZOHO_WEBHOOK_SIGNING_KEY: 'test-signing-key',
});

// ---- Stub Zoho (token + payment sessions); everything else goes to the real fetch ----
const realFetch = globalThis.fetch;
const sessions = new Map();
let seq = Date.now(); // unique per run so old local records never collide
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  if (u.startsWith('https://accounts.zoho.in/oauth/v2/token')) return json(200, { access_token: 'tok', expires_in: 3600 });
  if (u.startsWith('https://payments.zoho.in/api/v1/paymentsessions')) {
    if (!String(opts.headers?.Authorization).startsWith('Zoho-oauthtoken ')) return json(401, { code: 57, message: 'auth' });
    if (opts.method === 'POST') {
      const body = JSON.parse(opts.body);
      const id = String(++seq);
      sessions.set(id, { payments_session_id: id, amount: body.amount.toFixed(2), status: 'created', payments: [] });
      return json(201, { code: 0, payments_session: sessions.get(id) });
    }
    const id = u.split('/paymentsessions/')[1].split('?')[0];
    return sessions.has(id) ? json(200, { code: 0, payments_session: sessions.get(id) }) : json(404, { code: 1, message: 'nf' });
  }
  return realFetch(url, opts);
};
const markPaid = (id, amount) => {
  const s = sessions.get(id);
  s.status = 'succeeded';
  if (amount) s.amount = amount;
  s.payments = [{ payment_id: `pay${id}`, status: 'succeeded' }];
};

const { connectDatabase } = await import('./config/database.js');
await connectDatabase();
const { default: app } = await import('./app.js');
const server = app.listen(0);
const BASE = `http://127.0.0.1:${server.address().port}/api`;

let passed = 0;
let failed = 0;
const ok = (c, m) => {
  console.log(`${c ? 'PASS' : 'FAIL'} ${m}`);
  c ? passed++ : failed++;
};
const post = (path, body, token, headers = {}) =>
  realFetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const sign = (raw, t = Date.now()) =>
  `t=${t},v=${crypto.createHmac('sha256', 'test-signing-key').update(`${t}.${raw}`).digest('hex')}`;

const register = async (gender) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ fullName: 'Zoho Test', email: `zoho.${gender}.${Date.now()}@example.com`, password: 'Pass@123', phone: `97${Date.now().toString().slice(-8)}`, gender, age: '27', district: 'Chennai' }))
    fd.append(k, v);
  const r = await realFetch(`${BASE}/auth/register`, { method: 'POST', body: fd }).then((x) => x.json());
  return r;
};

try {
  const a = await register('groom');
  ok(a.success, 'register member A');

  // 1. Create session
  const s1 = await post('/payment/create-session', { planId: 'annual_premium' }, a.token).then((r) => r.json());
  ok(s1.success && s1.paymentsSessionId && s1.apiKey === 'test-widget-key' && s1.accountId === '60092805981', 'create-session returns widget config + session id');
  ok(s1.amount > 0 && s1.description, `session amount ₹${s1.amount}`);
  const bad = await post('/payment/create-session', { planId: 'nope' }, a.token);
  ok(bad.status === 400, 'unknown plan rejected');
  const anon = await post('/payment/create-session', { planId: 'annual_premium' });
  ok(anon.status === 401, 'create-session requires login');

  // 2. Confirm before paying -> not activated
  const early = await post('/payment/confirm', { paymentsSessionId: s1.paymentsSessionId }, a.token);
  ok(early.status === 402, 'confirm before payment does not activate');

  // 3. Another member cannot confirm A's session
  const b = await register('bride');
  const steal = await post('/payment/confirm', { paymentsSessionId: s1.paymentsSessionId }, b.token);
  ok(steal.status === 404, "member B cannot confirm member A's session");

  // 4. Amount mismatch -> refused
  markPaid(s1.paymentsSessionId, '1.00');
  const mism = await post('/payment/confirm', { paymentsSessionId: s1.paymentsSessionId }, a.token);
  ok(mism.status === 402, 'amount mismatch refused');

  // 5. Proper payment -> premium
  markPaid(s1.paymentsSessionId, Number(s1.amount).toFixed(2));
  const conf = await post('/payment/confirm', { paymentsSessionId: s1.paymentsSessionId }, a.token).then((r) => r.json());
  ok(conf.success && conf.user?.subscriptionStatus === 'premium', 'confirm activates premium');
  const exp1 = new Date(conf.user.premiumExpiresAt).getTime();
  const days = Math.round((exp1 - Date.now()) / 86400000);
  ok(days >= 364 && days <= 366, `annual plan gives ~365 days (${days})`);

  // 6. Duplicate confirm + webhook must not extend again
  const again = await post('/payment/confirm', { paymentsSessionId: s1.paymentsSessionId }, a.token).then((r) => r.json());
  const raw = JSON.stringify({ event_type: 'payment.succeeded', event_object: { payment: { payments_session_id: s1.paymentsSessionId, payment_id: `pay${s1.paymentsSessionId}`, amount: s1.amount } } });
  const wh = await post('/payment/zoho/webhook', raw, null, { 'X-Zoho-Webhook-Signature': sign(raw) });
  ok(wh.status === 200, 'valid webhook accepted');
  const me = await realFetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${a.token}` } }).then((r) => r.json());
  ok(again.success && new Date(me.user.premiumExpiresAt).getTime() === exp1, 'repeat confirm + webhook do not extend twice');

  // 7. Webhook-only path (member closed the tab): marquee for B
  const s2 = await post('/payment/create-session', { planId: 'featured_marquee' }, b.token).then((r) => r.json());
  markPaid(s2.paymentsSessionId, Number(s2.amount).toFixed(2));
  const raw2 = JSON.stringify({ event_type: 'payment.succeeded', event_object: { payment: { payments_session_id: s2.paymentsSessionId } } });
  const forged = await post('/payment/zoho/webhook', raw2, null, { 'X-Zoho-Webhook-Signature': 't=1,v=abcd' });
  ok(forged.status === 401, 'forged webhook signature rejected');
  const stale = await post('/payment/zoho/webhook', raw2, null, { 'X-Zoho-Webhook-Signature': sign(raw2, Date.now() - 60 * 60 * 1000) });
  ok(stale.status === 401, 'replayed (hour-old) webhook rejected');
  const wh2 = await post('/payment/zoho/webhook', raw2, null, { 'X-Zoho-Webhook-Signature': sign(raw2) });
  const meB = await realFetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${b.token}` } }).then((r) => r.json());
  ok(wh2.status === 200 && meB.user.isFeatured === true, 'webhook alone activates the marquee plan');

  // 8. Already premium -> cannot buy premium again
  const dup = await post('/payment/create-session', { planId: 'monthly_premium' }, a.token);
  ok(dup.status === 400, 'active premium member cannot start another premium payment');

  // 9. Old manual-UPI endpoints are gone
  const old = await post('/payment/submit-proof', {}, a.token);
  ok(old.status === 404, 'old submit-proof endpoint removed');
} catch (e) {
  ok(false, `exception: ${e.stack}`);
}

console.log(`\nRESULTS: ${passed} passed, ${failed} failed`);
server.close();
process.exit(failed ? 1 : 0);
