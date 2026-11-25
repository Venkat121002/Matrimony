/**
 * One-off migration to the Matrimony tenant (run once per environment, safe to re-run).
 *
 *   1. Copies the legacy root collections (users, payments, settings, supportTickets, profileViews,
 *      counters) into `Matrimony/main/<collection>`, keeping document ids. Existing tenant documents
 *      are never overwritten; counters keep the higher value. Legacy documents are NOT deleted.
 *   2. Imports every member that still has a bcrypt password into the Identity Platform tenant
 *      (AUTH_TENANT_ID) with that same hash, so existing passwords keep working, then stores
 *      `authUid` / `authEmail` on the member document and removes the stored hash.
 *
 * Usage (needs Google credentials with Firestore + Identity Platform admin access, e.g.
 * `gcloud auth application-default login` or GOOGLE_APPLICATION_CREDENTIALS):
 *
 *   cd backend
 *   node scripts/migrateToTenant.js --dry-run     # only report what would happen
 *   node scripts/migrateToTenant.js               # do it
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '../.env.swordnex-client-server') });
process.env.DB_TYPE = 'firestore';
process.env.FIREBASE_PROJECT_ID ||= 'swordnex-client-server';

const DRY_RUN = process.argv.includes('--dry-run');
const LEGACY_COLLECTIONS = ['users', 'payments', 'settings', 'supportTickets', 'profileViews', 'counters'];
const IMPORT_BATCH = 500;

const { FieldValue } = await import('firebase-admin/firestore');
const { db, tenantCol, tenantAuth, TENANT_NAME, AUTH_TENANT_ID } = await import('../config/firebase.js');
const { authEmailCandidates } = await import('../services/tenantAuthService.js');

if (!tenantAuth) {
  console.error('AUTH_TENANT_ID is not set (expected in .env.swordnex-client-server). Aborting.');
  process.exit(1);
}

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Migrating to tenant "${TENANT_NAME}" (auth tenant ${AUTH_TENANT_ID})\n`);

// ── 1. Copy collections ──────────────────────────────────────────────────────
for (const name of LEGACY_COLLECTIONS) {
  const legacy = await db.collection(name).get();
  const target = tenantCol(name);
  let copied = 0;
  let skipped = 0;

  for (const doc of legacy.docs) {
    const ref = target.doc(doc.id);
    const existing = await ref.get();

    if (existing.exists) {
      // The nikahId counter must never go backwards.
      if (name === 'counters' && (doc.data().value || 0) > (existing.data().value || 0) && !DRY_RUN) {
        await ref.set(doc.data());
        copied++;
      } else {
        skipped++;
      }
      continue;
    }
    if (!DRY_RUN) await ref.set(doc.data());
    copied++;
  }
  console.log(`${name.padEnd(14)} legacy ${String(legacy.size).padStart(5)}  copied ${String(copied).padStart(5)}  already there ${String(skipped).padStart(5)}`);
}

// ── 2. Import member logins into the Identity Platform tenant ───────────────
const snap = await tenantCol('users').get();
const pending = snap.docs
  .map((d) => ({ id: d.id, ...d.data() }))
  .filter((u) => !u.authUid && u.password);

console.log(`\nMembers to import into the auth tenant: ${pending.length}`);

const usedEmails = new Set(snap.docs.map((d) => d.data().authEmail).filter(Boolean));
let imported = 0;
const failed = [];

// Each member is tried with their candidate addresses in order (real email, phone, Nikah ID).
let queue = pending.map((u) => ({ user: u, candidates: authEmailCandidates(u), attempt: 0 }));

while (queue.length && !DRY_RUN) {
  const retry = [];

  for (let i = 0; i < queue.length; i += IMPORT_BATCH) {
    const chunk = queue.slice(i, i + IMPORT_BATCH);
    const records = [];
    const picked = [];

    for (const item of chunk) {
      const email = item.candidates.slice(item.attempt).find((c) => !usedEmails.has(c));
      if (!email) {
        failed.push({ nikahId: item.user.nikahId, reason: 'no free email address' });
        continue;
      }
      usedEmails.add(email);
      item.email = email;
      item.attempt = item.candidates.indexOf(email) + 1;
      picked.push(item);
      records.push({
        uid: item.user.id,
        email,
        displayName: item.user.fullNameEn || item.user.fullName || undefined,
        passwordHash: Buffer.from(item.user.password),
      });
    }
    if (!records.length) continue;

    const result = await tenantAuth.importUsers(records, { hash: { algorithm: 'BCRYPT' } });
    const bad = new Map(result.errors.map((e) => [e.index, e.reason?.message || 'import error']));

    for (let r = 0; r < picked.length; r++) {
      const item = picked[r];
      if (bad.has(r)) {
        usedEmails.delete(item.email);
        if (item.attempt < item.candidates.length) retry.push(item);
        else failed.push({ nikahId: item.user.nikahId, reason: bad.get(r) });
        continue;
      }
      await tenantCol('users').doc(item.user.id).update({
        authUid: item.user.id,
        authEmail: item.email,
        password: FieldValue.delete(),
        updatedAt: new Date(),
      });
      imported++;
    }
  }
  queue = retry;
}

console.log(`Imported: ${imported}${DRY_RUN ? ' (dry run, nothing written)' : ''}`);
if (failed.length) {
  console.log(`Failed: ${failed.length}`);
  failed.forEach((f) => console.log(`  nikahId ${f.nikahId}: ${f.reason}`));
}
console.log('\nDone. Legacy root collections were left untouched; delete them once you have verified the app.');
process.exit(failed.length ? 2 : 0);
