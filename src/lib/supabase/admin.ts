// /lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRole!,
  { auth: { persistSession: false } }
);
