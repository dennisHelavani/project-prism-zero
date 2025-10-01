import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { monthKey } from '@/lib/codes';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false, error: 'email_required' }, { status: 400 });

  const { data: cust } = await supabaseAdmin.from('customers').select('id').eq('email', email).single();
  if (!cust) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // month_key must be an ISO date (YYYY-MM-DD). monthKey() already returns ISO string.
  const mkey = monthKey().slice(0, 10);
  const { data: codeRow } = await supabaseAdmin
    .from('monthly_codes')
    .select('code_hash, created_at, expires_at') // (We don't have the plain code; for MVP you can create a new code here)
    .eq('customer_id', cust.id)
    .eq('month_key', mkey)
    .single();

  // MVP: create a new code if you want resend to work with a plain code again (or store encrypted).
  return NextResponse.json({ ok: true, note: 'Implement email send here (Resend/Mailgun).' });
}
