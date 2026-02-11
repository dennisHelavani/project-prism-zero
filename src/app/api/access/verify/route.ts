// /app/api/access/verify/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

function redirectToError(reason: string) {
  const url = new URL('/access/error', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const code = String(form.get('code') ?? '').trim().toUpperCase();

    // Check for missing fields
    if (!email || !code) {
      return redirectToError('missing');
    }

    const { data, error } = await supabaseAdmin
      .from('access_links')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    // Invalid email/code combination
    if (error || !data) {
      return redirectToError('invalid');
    }

    // Check if code has expired
    if (new Date(data.expires_at).getTime() < Date.now()) {
      return redirectToError('expired');
    }

    // Optional: track usage without blocking (subscription-style access)
    await supabaseAdmin
      .from('access_links')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    // Success - redirect to forms page
    const url = new URL('/access/forms', process.env.NEXT_PUBLIC_SITE_URL);
    url.searchParams.set('code', code);
    url.searchParams.set('email', email);
    return NextResponse.redirect(url, { status: 303 });

  } catch (err) {
    console.error('Access verification error:', err);
    return redirectToError('unknown');
  }
}
