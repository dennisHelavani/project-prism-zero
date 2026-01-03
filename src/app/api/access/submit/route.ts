// /app/api/access/submit/route.ts
// Handles form submissions - validates code, inserts into submissions table
// Codes are REUSABLE until expires_at (no "used" blocking)

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

export async function POST(req: Request) {
  const form = await req.formData();

  // Extract code and product
  const code = String(form.get('code') ?? '').trim().toUpperCase();
  const product = String(form.get('product') ?? '').trim().toUpperCase();

  console.log('=== /api/access/submit ===');
  console.log('Code:', code);
  console.log('Product:', product);

  // Basic validation
  if (!code) {
    console.log('ERROR: Missing code');
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }
  if (!product || (product !== 'CPP' && product !== 'RAMS')) {
    console.log('ERROR: Missing or invalid product');
    return NextResponse.json({ error: 'Missing or invalid product' }, { status: 400 });
  }

  // Collect all other form fields into placeholders object
  const placeholders: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key !== 'code' && key !== 'product') {
      placeholders[key] = String(value ?? '');
    }
  }

  console.log('Placeholders keys:', Object.keys(placeholders));

  // Fetch access record
  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    console.log('ERROR: Invalid code - not found in access_links');
    console.log('Supabase error:', error);
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const customerEmail = data.email || '';
  console.log('Customer email from access_links:', customerEmail);

  // Check expiry ONLY - codes are reusable until expired
  if (new Date(data.expires_at).getTime() < Date.now()) {
    console.log('ERROR: Code expired at', data.expires_at);
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });
  }

  console.log('Code is valid and not expired. Inserting into submissions...');

  // Insert into submissions table - matches exact schema:
  // product, customer_email, placeholders, uploads, ai_input, access_code, outputs
  const submissionPayload = {
    product: product,                    // text, required
    customer_email: customerEmail,       // text, required
    placeholders: placeholders,          // jsonb, default {}
    uploads: {},                         // jsonb, default {} - files optional
    ai_input: {},                        // jsonb, default {} - for future AI
    access_code: code,                   // text, optional
    outputs: {},                         // jsonb, default {} - doc outputs
  };

  console.log('Table: public.submissions');
  console.log('Payload:', JSON.stringify(submissionPayload, null, 2));

  const { data: insertedRow, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert(submissionPayload)
    .select()
    .single();

  if (insertError) {
    console.log('ERROR: Failed to insert into submissions');
    console.log('Insert error code:', insertError.code);
    console.log('Insert error message:', insertError.message);
    console.log('Insert error details:', insertError.details);
    console.log('Insert error hint:', insertError.hint);
    return NextResponse.json(
      {
        error: 'Failed to save submission',
        details: insertError.message,
        hint: insertError.hint,
      },
      { status: 500 }
    );
  }

  console.log('SUCCESS: Submission inserted');
  console.log('Inserted row ID:', insertedRow?.id);
  console.log('==========================');

  // Only redirect after successful insert
  const url = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('product', product);
  return NextResponse.redirect(url, { status: 303 });
}
