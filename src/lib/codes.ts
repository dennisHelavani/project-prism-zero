// src/lib/codes.ts
import { createAdminClient } from './supabase-admin';
import crypto from 'crypto';

const supabase = createAdminClient();

/** Lowercase + trim for consistent lookups */
export function canonicalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

/** Normalize human-entered code (strip spaces/dashes, uppercase) */
export function normalizeCode(code: string) {
  return code.replace(/[\s-]+/g, '').toUpperCase();
}

/** Cryptographically-strong A–Z0–9 code (no 0/O/1/I) */
export function generatePlainCode(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/** Alias for callers expecting `generateCode` */
export const generateCode = generatePlainCode;

function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** Add N calendar days in UTC (returns Date in UTC day granularity) */
export function addUtcDays(days = 30): Date {
  const now = new Date();
  const d = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Alias for callers expecting `addDaysUTC` */
export const addDaysUTC = addUtcDays;

/** First day of given month at 00:00:00Z as ISO string (for timestamptz month bucket) */
export function monthKeyUtc(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  return new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)).toISOString();
}

/** Aliases for callers that used earlier names */
export const monthKeyISO = monthKeyUtc;
export const monthKey = monthKeyUtc;

/** Get-or-create customer idempotently (case/space-insensitive) */
export async function upsertCustomerByEmail(email: string) {
  const e = canonicalizeEmail(email);

  // 1) Try to find
  const { data: found, error: selErr } = await supabase
    .from('customers')
    .select('*')
    .eq('email', e)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (found) return found;

  // 2) Insert normalized
  const { data: created, error: insErr } = await supabase
    .from('customers')
    .insert({ email: e })
    .select('*')
    .single();
  if (!insErr && created) return created;

  // 3) Race condition: unique violation → reselect
  // @ts-ignore (PostgrestError has 'code' field at runtime)
  if (insErr?.code === '23505') {
    const { data: again, error: selErr2 } = await supabase
      .from('customers')
      .select('*')
      .eq('email', e)
      .limit(1)
      .maybeSingle();
    if (selErr2) throw selErr2;
    if (again) return again;
  }

  throw insErr;
}

/**
 * Save/replace a monthly code (stores hash).
 * Unique (customer_id, month_key) ensures only one row per month.
 */
export async function saveMonthlyCode(
  customerId: string,
  codePlain: string,
  expiresAt: Date,
  monthKeyISOValue: string
) {
  const code_hash = sha256Hex(normalizeCode(codePlain));

  const { error } = await supabase
    .from('monthly_codes')
    .upsert(
      {
        customer_id: customerId,
        month_key: monthKeyISOValue,
        code_hash,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
      { onConflict: 'customer_id,month_key' } // replace existing month’s code
    );

  if (error) throw error;
}

/** Latest active (unused & unexpired) code row for an email */
export async function latestActiveCodeForEmail(email: string) {
  const e = canonicalizeEmail(email);

  const { data: cust, error: ce } = await supabase
    .from('customers')
    .select('id')
    .eq('email', e)
    .maybeSingle();
  if (ce || !cust) return null;

  const { data, error } = await supabase
    .from('monthly_codes')
    .select('id, code_hash, expires_at, used, created_at')
    .eq('customer_id', cust.id)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

/** Compare a plain code against a stored hash (case/format agnostic) */
export function matchesCodeHash(plain: string, hashHex: string) {
  return sha256Hex(normalizeCode(plain)) === hashHex;
}

/** Mark a code as used after successful unlock */
export async function markCodeUsed(codeRowId: string) {
  const { error } = await supabase
    .from('monthly_codes')
    .update({ used: false })
    .eq('id', codeRowId);
  if (error) throw error;
}
