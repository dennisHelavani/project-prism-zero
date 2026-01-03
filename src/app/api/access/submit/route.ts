// /app/api/access/submit/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(req: Request) {
  const form = await req.formData();

  const code = String(form.get('code') ?? '').trim().toUpperCase();
  const product = String(form.get('product') ?? '').trim().toUpperCase();
  const prompt = String(form.get('prompt') ?? '').trim();

  // Basic validation
  if (!code || !prompt) {
    return NextResponse.json({ error: 'Missing code or prompt' }, { status: 400 });
  }
  if (!product) {
    return NextResponse.json({ error: 'Missing product' }, { status: 400 });
  }

  // Fetch access record
  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  // Subscription-style: only expiry blocks reuse
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });
  }

  // OPTIONAL (recommended): enforce product match if your access_links table includes a product column
  // Uncomment and adjust the column name if you have it (common names: product, product_type).
  //
  // const allowedProduct =
  //   String((data.product_type ?? data.product ?? '')).trim().toUpperCase();
  // if (allowedProduct && allowedProduct !== product) {
  //   return NextResponse.json({ error: 'Code not valid for this product' }, { status: 403 });
  // }

  // IMPORTANT:
  // We DO NOT mark the code as used anymore.
  // Codes remain reusable until expires_at.

  // TODO (next phase): Save submission payload to DB (submissions table)
  // TODO (next phase): Call Python DOCX/PDF generator

  const url = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('product', product);
  return NextResponse.redirect(url, { status: 303 });
}
