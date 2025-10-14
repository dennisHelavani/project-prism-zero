// /app/api/tally/complete/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') || '').toUpperCase();

  if (!code) {
    const back = new URL('/access', process.env.NEXT_PUBLIC_SITE_URL);
    back.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(back, { status: 303 });
  }

  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('used,expires_at')
    .eq('code', code)
    .single();

  if (error || !data) {
    const back = new URL('/access', process.env.NEXT_PUBLIC_SITE_URL);
    back.searchParams.set('error', 'invalid_code');
    return NextResponse.redirect(back, { status: 303 });
  }

  if (data.used || new Date(data.expires_at).getTime() < Date.now()) {
    const back = new URL('/access', process.env.NEXT_PUBLIC_SITE_URL);
    back.searchParams.set('error', data.used ? 'already_used' : 'expired');
    return NextResponse.redirect(back, { status: 303 });
  }

  await supabaseAdmin.from('access_links').update({ used: true }).eq('code', code);

  const done = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL);
  done.searchParams.set('code', code);
  return NextResponse.redirect(done, { status: 303 });
}
