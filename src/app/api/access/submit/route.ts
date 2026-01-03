// /app/api/access/submit/route.ts
// Handles form submissions - validates code, inserts into submissions table, triggers doc generation
// Codes are REUSABLE until expires_at (no "used" blocking)

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

// Python doc-generator service URL
const DOC_GENERATOR_URL = process.env.DOC_GENERATOR_URL || 'http://localhost:8000';

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

  // Parse placeholders from form data
  let placeholders: Record<string, string> = {};
  const placeholdersRaw = form.get('placeholders');
  if (placeholdersRaw && typeof placeholdersRaw === 'string') {
    try {
      placeholders = JSON.parse(placeholdersRaw);
    } catch {
      console.log('Failed to parse placeholders JSON, collecting from form fields');
    }
  }

  // If placeholders not parsed from JSON, collect from form fields
  if (Object.keys(placeholders).length === 0) {
    for (const [key, value] of form.entries()) {
      if (key !== 'code' && key !== 'product' && key !== 'placeholders' && key !== 'ai_input') {
        placeholders[key] = String(value ?? '');
      }
    }
  }

  // Parse AI input if present
  let aiInput: Record<string, string> = {};
  const aiInputRaw = form.get('ai_input');
  if (aiInputRaw && typeof aiInputRaw === 'string') {
    try {
      aiInput = JSON.parse(aiInputRaw);
    } catch {
      console.log('Failed to parse ai_input JSON');
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
    product: product,
    customer_email: customerEmail,
    placeholders: placeholders,
    uploads: {},
    ai_input: aiInput,
    access_code: code,
    outputs: {}, // Will be populated after generation
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
    console.log('Insert error:', insertError);
    return NextResponse.json(
      { error: 'Failed to save submission', details: insertError.message },
      { status: 500 }
    );
  }

  const submissionId = insertedRow?.id;
  console.log('SUCCESS: Submission inserted, ID:', submissionId);

  // Trigger document generation (fire and forget - non-blocking)
  // The Python service will update the submission outputs when done
  if (submissionId) {
    triggerDocGeneration(submissionId).catch((err) => {
      console.error('Doc generation trigger failed:', err);
    });
  }

  console.log('==========================');

  // Redirect to thank you page with submission ID
  const url = new URL('/thanks', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  url.searchParams.set('id', submissionId);
  url.searchParams.set('product', product);
  return NextResponse.redirect(url, { status: 303 });
}

/**
 * Trigger document generation via Python service.
 * This is fire-and-forget - the Python service updates Supabase when done.
 */
async function triggerDocGeneration(submissionId: string): Promise<void> {
  console.log(`Triggering doc generation for submission: ${submissionId}`);

  try {
    const res = await fetch(`${DOC_GENERATOR_URL}/generate-from-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: submissionId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Doc generation failed: ${res.status} - ${errorText}`);

      // Update submission with error
      await supabaseAdmin
        .from('submissions')
        .update({ outputs: { error: `Generation failed: ${res.status}` } })
        .eq('id', submissionId);
    } else {
      const result = await res.json();
      console.log('Doc generation result:', result);
    }
  } catch (err) {
    console.error('Failed to call doc generator:', err);

    // Update submission with error
    await supabaseAdmin
      .from('submissions')
      .update({ outputs: { error: 'Failed to connect to doc generator service' } })
      .eq('id', submissionId);
  }
}
