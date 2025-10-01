import { createAdminClient } from './supabase-admin';
import crypto from 'crypto';

const supabase = createAdminClient();

export function canonicalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

export function generatePlainCode(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function sha256Hex(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function addUtcDays(days = 30): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** First day of current month at 00:00:00Z (useful if month_key is timestamptz) */
export function monthKeyUtc(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  return new Date(Date.UTC(y, m, 1, 0, 0, 0, 0)).toISOString();
}

export const monthKey = monthKeyUtc;

/** Get-or-create customer idempotently (case/space-insensitive) */
export async function upsertCustomerByEmail(email: string) {
  const e = canonicalizeEmail(email);

  // 1) find
  const { data: found, error: selErr } = await supabase
    .from('customers')
    .select('*')
    .eq('email', e)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (found) return found;

  // 2) insert (normalized)
  const { data: created, error: insErr } = await supabase
    .from('customers')
    .insert({ email: e })
    .select('*')
    .single();

  if (!insErr && created) return created;

  // 3) race: reselect on duplicate
  // @ts-ignore (PostgrestError has 'code' at runtime)
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
 * Save/replace a monthly code (hash is stored).
 * Unique (customer_id, month_key) ensures only one row per month.
 */
export async function saveMonthlyCode(
  customerId: string,
  codePlain: string,
  expiresAt: Date,
  monthKeyISO: string
) {
  const code_hash = sha256Hex(codePlain);

  const { error } = await supabase
    .from('monthly_codes')
    .upsert(
      {
        customer_id: customerId,
        month_key: monthKeyISO,
        code_hash,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
      { onConflict: 'customer_id,month_key' } // ← replace existing month’s code
    );

  if (error) throw error;
}

/** Fetch the latest active (not used, not expired) code row for a customer email */
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

/** Optional: mark a code row as used after successful unlock */
export async function markCodeUsed(codeRowId: string) {
  const { error } = await supabase
    .from('monthly_codes')
    .update({ used: true })
    .eq('id', codeRowId);
  if (error) throw error;
}
