// /app/api/access/submit/route.ts
// Handles form submissions - validates code, inserts into submissions table, triggers doc generation
// Codes are REUSABLE until expires_at (no "used" blocking)

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

// IMPORTANT: do NOT default to localhost in production.
// If DOCGEN_URL is missing, we want a loud failure + clear logs.
const DOC_GENERATOR_URL = (process.env.DOCGEN_URL || '').replace(/\/$/, '');
const DOCGEN_KEY = process.env.DOCGEN_KEY || '';

export async function POST(req: Request) {
  const form = await req.formData();

  const code = String(form.get('code') ?? '').trim().toUpperCase();
  const product = String(form.get('product') ?? '').trim().toUpperCase();

  console.log('=== /api/access/submit ===');
  console.log('Code:', code);
  console.log('Product:', product);

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  if (!product || (product !== 'CPP' && product !== 'RAMS')) {
    return NextResponse.json({ error: 'Missing or invalid product' }, { status: 400 });
  }

  // Parse placeholders JSON if present
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

  console.log('Placeholders count:', Object.keys(placeholders).length);
  console.log('Placeholders sample keys:', Object.keys(placeholders).slice(0, 10));

  // Handle file uploads to Supabase Storage
  const uploads: Record<string, string> = {};
  const uploadableFields = [
    // CPP Images
    { formKey: 'CPP_COMPANY_LOGO_IMG', placeholderKey: 'CPP_LOGO_COVER_MIDDLE_IMG' }, // Cover page logo only
    { formKey: 'CPP_DELIVERIES_IMG', placeholderKey: 'CPP_DELIVERIES_IMG' },
    // RAMS Images
    { formKey: 'RAMS_COMPANY_LOGO_IMG', placeholderKey: 'RAMS_COVER_PAGE_LOGO_IMG' },
    { formKey: 'RAMS_CLIENT_LOGO_IMG', placeholderKey: 'RAMS_CLIENT_PAGE_LOGO_IMG' },
    { formKey: 'RAMS_DELIVERIES_IMG', placeholderKey: 'RAMS_DELIVERIES_IMG' },
    { formKey: 'RAMS_FIRE_PLAN_IMG', placeholderKey: 'RAMS_FIRE_PLAN_IMG' },
    { formKey: 'RAMS_NEAREST_HOSPITAL_IMG', placeholderKey: 'RAMS_NEAREST_HOSPITAL_IMG' },
  ];

  const tempSubmissionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const uploadedUrls: Record<string, string> = {};

  for (const { formKey, placeholderKey } of uploadableFields) {
    const file = form.get(formKey);
    if (file && file instanceof File && file.size > 0) {
      try {
        if (uploadedUrls[formKey]) {
          uploads[placeholderKey] = uploadedUrls[formKey];
          continue;
        }

        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${tempSubmissionId}/${formKey}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('document-uploads')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload ${formKey}:`, uploadError);
          continue;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('document-uploads')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls[formKey] = urlData.publicUrl;
          uploads[placeholderKey] = urlData.publicUrl;
        }
      } catch (err) {
        console.error(`Error uploading ${formKey}:`, err);
      }
    }
  }

  // Ensure optional logo placeholders exist even if not uploaded
  const optionalLogos = ['CPP_LOGO_COVER_MIDDLE_IMG', 'RAMS_COVER_PAGE_LOGO_IMG', 'RAMS_CLIENT_PAGE_LOGO_IMG'];
  for (const key of optionalLogos) {
    if (!uploads[key]) placeholders[key] = '';
  }

  console.log('Uploads keys:', Object.keys(uploads));

  // Fetch access record
  const { data, error } = await supabaseAdmin
    .from('access_links')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) {
    console.log('ERROR: Invalid code - not found in access_links', error);
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const customerEmail = data.email || '';

  // Check expiry ONLY
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });
  }

  const submissionPayload = {
    product,
    customer_email: customerEmail,
    placeholders,
    uploads,
    ai_input: aiInput,
    access_code: code,
    outputs: {},
  };

  const { data: insertedRow, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert(submissionPayload)
    .select()
    .single();

  if (insertError) {
    console.log('ERROR: Failed to insert into submissions', insertError);
    return NextResponse.json(
      { error: 'Failed to save submission', details: insertError.message },
      { status: 500 }
    );
  }

  const submissionId = insertedRow?.id;
  console.log('SUCCESS: Submission inserted, ID:', submissionId);

  // Trigger document generation (fire and forget)
  if (submissionId) {
    triggerDocGeneration(submissionId).catch((err) => {
      console.error('Doc generation trigger failed:', err);
    });
  }

  const redirectUrl = `/thanks?id=${submissionId}&product=${product}`;
  return NextResponse.json({ success: true, submissionId, redirectUrl });
}

async function triggerDocGeneration(submissionId: string): Promise<void> {
  console.log(`Triggering doc generation for submission: ${submissionId}`);

  // Hard fail loudly if production env vars are missing
  if (!DOC_GENERATOR_URL) {
    console.error('DOCGEN_URL is missing. Set it in DigitalOcean env vars for the WEBSITE component.');
    await supabaseAdmin
      .from('submissions')
      .update({ outputs: { error: 'DOCGEN_URL not configured' } })
      .eq('id', submissionId);
    return;
  }

  // If your docgen service uses auth, you MUST pass DOCGEN_KEY
  if (!DOCGEN_KEY) {
    console.error('DOCGEN_KEY is missing. Set it in DigitalOcean env vars for the WEBSITE component.');
    await supabaseAdmin
      .from('submissions')
      .update({ outputs: { error: 'DOCGEN_KEY not configured' } })
      .eq('id', submissionId);
    return;
  }

  const url = `${DOC_GENERATOR_URL}/generate-from-submission`;
  console.log('Calling docgen URL:', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DOCGEN-KEY': DOCGEN_KEY,
      },
      body: JSON.stringify({ submission_id: submissionId }),
    });

    const bodyText = await res.text();
    console.log('Docgen response status:', res.status);
    console.log('Docgen response body (first 500):', bodyText.slice(0, 500));

    if (!res.ok) {
      await supabaseAdmin
        .from('submissions')
        .update({ outputs: { error: `Generation failed: ${res.status}`, detail: bodyText.slice(0, 500) } })
        .eq('id', submissionId);
      return;
    }

    // In case docgen returns JSON, log it (don’t crash if not JSON)
    try {
      const parsed = JSON.parse(bodyText);
      console.log('Doc generation result JSON:', parsed);
    } catch {
      // ok
    }
  } catch (err: any) {
    console.error('Failed to call doc generator:', err?.message || err);

    await supabaseAdmin
      .from('submissions')
      .update({ outputs: { error: 'Failed to connect to doc generator service' } })
      .eq('id', submissionId);
  }
}
