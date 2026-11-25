// One-time: turn a Zoho OAuth authorization code into a long-lived refresh token.
//
//   node scripts/zohoExchangeCode.js "<code or the full https://tamilmuslimnikkah.com/?code=... URL>" [redirect_uri]
//
// redirect_uri must be exactly the "Authorized Redirect URI" of the client in api-console.zoho.in
// (default https://tamilmuslimnikkah.com/).
//
// Reads ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET from .env.local and writes ZOHO_REFRESH_TOKEN back
// into .env.local (gitignored). The code is only valid for about a minute, so run this right
// after approving access in the browser.
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const REDIRECT_URI = process.argv[3] || 'https://tamilmuslimnikkah.com/';
const envPath = fileURLToPath(new URL('../.env.local', import.meta.url));
dotenv.config({ path: envPath });

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/zohoExchangeCode.js "<code or redirect URL>"');
  process.exit(1);
}
let code = arg.trim();
let accountsServer = 'https://accounts.zoho.in';
if (code.startsWith('http')) {
  const u = new URL(code);
  code = u.searchParams.get('code') || '';
  if (u.searchParams.get('accounts-server')) accountsServer = u.searchParams.get('accounts-server');
}
if (!code) {
  console.error('No ?code= found in what you pasted.');
  process.exit(1);
}

const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env;
if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
  console.error('ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET missing in .env.local');
  process.exit(1);
}

const res = await fetch(`${accountsServer}/oauth/v2/token`, {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
  }),
});
const data = await res.json().catch(() => ({}));
if (!data.refresh_token) {
  console.error('Zoho did not return a refresh token:', data.error || res.status);
  console.error('Codes expire in about a minute and can be used once - generate a new one and retry quickly.');
  process.exit(1);
}

let env = fs.readFileSync(envPath, 'utf8');
env = /^ZOHO_REFRESH_TOKEN=.*$/m.test(env)
  ? env.replace(/^ZOHO_REFRESH_TOKEN=.*$/m, `ZOHO_REFRESH_TOKEN=${data.refresh_token}`)
  : `${env.trimEnd()}\nZOHO_REFRESH_TOKEN=${data.refresh_token}\n`;
fs.writeFileSync(envPath, env);
console.log(`OK - refresh token saved to .env.local (scope: ${data.scope || 'n/a'}).`);
