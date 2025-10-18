import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { monthKey } from '@/lib/codes';

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) {
    return NextResponse.json({ ok: false, error: 'email_required' }, { status: 400 });
  }

  const { data: cust } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', email)
    .single();

  if (!cust) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  // Normalize monthKey to YYYY-MM-DD (works if monthKey() returns Date or string)
  //dummy comment
  const mk = monthKey() as string | Date;
  const mkey =
    typeof mk === 'string'
      ? (() => {
          const d = new Date(mk);
          return isNaN(d.getTime()) ? mk.slice(0, 10) : d.toISOString().slice(0, 10);
        })()
      : mk.toISOString().slice(0, 10);

  // Prefix with _ to silence noUnusedLocals if you aren't using it yet
  const { data: _codeRow } = await supabaseAdmin
    .from('monthly_codes')
    .select('code_hash, created_at, expires_at')
    .eq('customer_id', cust.id)
    .eq('month_key', mkey)
    .single();

  // TODO: actually send email (Resend/Mailgun/etc.)
  return NextResponse.json({ ok: true, note: 'Implement email send here (Resend/Mailgun).' });
}
