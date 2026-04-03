// /app/api/access/verify/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSiteOrigin } from '@/lib/url';



function redirectToError(reason: string) {
  const url = new URL(`${getSiteOrigin()}/access/error`);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
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
    const url = new URL(`${getSiteOrigin()}/access/forms`);
    url.searchParams.set('code', code);
    url.searchParams.set('email', email);
    return NextResponse.redirect(url, { status: 303 });

  } catch (err) {
    console.error('Access verification error:', err);
    return redirectToError('unknown');
  }
}
