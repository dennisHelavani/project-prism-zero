// /app/api/access/submit/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';


const supabaseAdmin = getSupabaseAdmin();
export async function POST(req: Request) {
  const form = await req.formData();
  const code = String(form.get('code') ?? '').trim().toUpperCase();
  const product = String(form.get('product') ?? '').trim().toUpperCase();
  const prompt = String(form.get('prompt') ?? '').trim();

  if (!code || !prompt) {
    return NextResponse.json({ error: 'Missing code or prompt' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  if (data.used) return NextResponse.json({ error: 'Code already used' }, { status: 400 });
  if (new Date(data.expires_at).getTime() < Date.now())
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });

  // Mark as used (one-shot)
  const { error: updErr } = await supabaseAdmin
    .from('access_links')
    .update({ used: true })
    .eq('code', code);

  if (updErr) return NextResponse.json({ error: 'Failed to mark used' }, { status: 500 });

  // TODO: kick off your actual generation job (DALL·E, etc.) here.
  // You have email + product in `data`, and request in `prompt`.

  const url = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('product', product);
  return NextResponse.redirect(url, { status: 303 });
}
