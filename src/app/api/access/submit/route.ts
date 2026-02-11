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

  // Generate a temporary submission ID for file paths (will be replaced with real ID)
  const tempSubmissionId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Track uploaded files to avoid re-uploading
  const uploadedUrls: Record<string, string> = {};

  for (const { formKey, placeholderKey } of uploadableFields) {
    const file = form.get(formKey);
    if (file && file instanceof File && file.size > 0) {
      try {
        // Check if we already uploaded this file
        if (uploadedUrls[formKey]) {
          // Reuse the URL for this placeholder key
          uploads[placeholderKey] = uploadedUrls[formKey];
          console.log(`Reused ${formKey} → ${placeholderKey}: ${uploadedUrls[formKey]}`);
          continue;
        }

        console.log(`Uploading file: ${formKey} (${file.size} bytes)`);

        // Create file path: document-uploads/{tempId}/{filename}
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${tempSubmissionId}/${formKey}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('document-uploads')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload ${formKey}:`, uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('document-uploads')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls[formKey] = urlData.publicUrl; // Cache for reuse
          uploads[placeholderKey] = urlData.publicUrl;
          console.log(`Uploaded ${formKey} → ${placeholderKey}: ${urlData.publicUrl}`);
        }
      } catch (err) {
        console.error(`Error uploading ${formKey}:`, err);
      }
    }
  }

  // Ensure optional logo placeholders are cleared if no image was uploaded
  // By setting them to empty string in placeholders (and NOT in uploads),
  // generator.py will treat them as text and replace with NBSP (empty line).
  // Ensure optional logo placeholders are cleared if no image was uploaded
  // By setting them to empty string in placeholders (and NOT in uploads),
  // generator.py will treat them as text. We will handle specific "3 lines" logic there if needed.
  const optionalLogos = ['CPP_LOGO_COVER_MIDDLE_IMG', 'RAMS_COVER_PAGE_LOGO_IMG', 'RAMS_CLIENT_PAGE_LOGO_IMG'];
  for (const key of optionalLogos) {
    if (!uploads[key]) {
      placeholders[key] = '';
    }
  }

  console.log('Uploads:', uploads);

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
    uploads, // Now contains Supabase Storage URLs
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

  // Return JSON with redirect URL (client will handle redirect)
  const redirectUrl = `/thanks?id=${submissionId}&product=${product}`;
  return NextResponse.json({
    success: true,
    submissionId,
    redirectUrl
  });
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
