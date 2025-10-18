import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';



const supabaseAdmin = getSupabaseAdmin();
export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get('token') ?? '');
  const prompt = String(form.get('prompt') ?? '').trim();

  if (!token || !prompt) {
    return NextResponse.json({ error: 'Missing token or prompt' }, { status: 400 });
  }

  // Validate + mark used (atomic-ish: validate first, then update)
  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  if (data.used)   return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  if (new Date(data.expires_at).getTime() < Date.now())
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });

  // Mark used
  const { error: updErr } = await supabaseAdmin
    .from('access_links')
    .update({ used: true })
    .eq('token', token);

  if (updErr) return NextResponse.json({ error: 'Failed to mark used' }, { status: 500 });

  // TODO: kick off your generation job here (queue, background worker, etc.)
  // For now, just redirect to a thank-you
  const url = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('prompt', prompt.slice(0, 100));
  return NextResponse.redirect(url, { status: 303 });
}
