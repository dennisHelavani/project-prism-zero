import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazy singleton — never throws at module-import time.
 * The client is only created on the first call, so a missing env var
 * only surfaces when a route/component actually needs it.
 */
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    throw new Error(
      `Missing Supabase admin config — ` +
      `SUPABASE_URL=${url ? 'SET' : 'UNSET'}, ` +
      `SUPABASE_SERVICE_ROLE=${key ? 'SET' : 'UNSET'}. ` +
      `Set these in your DigitalOcean environment variables.`
    );
  }

  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _admin;
}
