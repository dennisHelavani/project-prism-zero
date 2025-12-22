// /api/forms/submit - Stub endpoint for form submissions
// Logs form data and marks access code as used

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const product = formData.get('product') as string;
        const code = formData.get('code') as string;

        // Extract all form fields for logging
        const fields: Record<string, string | string[]> = {};
        const files: { name: string; size: number; type: string }[] = [];

        formData.forEach((value, key) => {
            if (value instanceof File) {
                files.push({
                    name: value.name,
                    size: value.size,
                    type: value.type,
                });
            } else {
                fields[key] = value;
            }
        });

        console.log('=== Form Submission ===');
        console.log('Product:', product);
        console.log('Code:', code);
        console.log('Fields:', JSON.stringify(fields, null, 2));
        console.log('Files:', files);
        console.log('=======================');

        // Mark the access code as used in the database
        if (code) {
            const supabaseAdmin = getSupabaseAdmin();
            const { error: updateError } = await supabaseAdmin
                .from('access_links')
                .update({ used: true })
                .eq('code', code.toUpperCase());

            if (updateError) {
                console.error('Failed to mark code as used:', updateError);
                // Don't fail the request, just log it
            } else {
                console.log('Access code marked as used:', code);
            }
        }

        // TODO: In a future phase, this is where you would:
        // 1. Store form data in the database
        // 2. Queue AI generation job
        // 3. Generate DOCX/PDF from templates
        // 4. Email documents to user

        return NextResponse.json({
            success: true,
            message: `Your ${product} request has been submitted successfully. You will receive your documents via email shortly.`,
        });
    } catch (error) {
        console.error('Form submission error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to process form submission' },
            { status: 500 }
        );
    }
}
