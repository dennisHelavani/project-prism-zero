// /app/api/access/verify/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';


const supabaseAdmin = getSupabaseAdmin();
export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const code = String(form.get('code') ?? '').trim().toUpperCase();

  if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
  if (data.used) return NextResponse.json({ error: 'Code already used' }, { status: 400 });
  if (new Date(data.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'Code expired' }, { status: 400 });

  const url = new URL('/access/forms', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('code', code);
  return NextResponse.redirect(url, { status: 303 });
}
