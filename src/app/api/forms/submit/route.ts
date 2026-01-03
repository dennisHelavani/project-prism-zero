// /api/forms/submit - Form submission endpoint
// Stores structured JSON payload with placeholder keys matching DOCX templates

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type SubmissionPayload = {
    product: 'CPP' | 'RAMS';
    email: string;
    placeholders: Record<string, string>;
    uploads: Record<string, { name: string; size: number; type: string }>;
    ai_input?: Record<string, string>;
    created_at: string;
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const product = formData.get('product') as string;
        const code = formData.get('code') as string;
        const email = formData.get('email') as string;

        // Parse the pre-built placeholders JSON
        let placeholders: Record<string, string> = {};
        const placeholdersStr = formData.get('placeholders');
        if (placeholdersStr && typeof placeholdersStr === 'string') {
            try {
                placeholders = JSON.parse(placeholdersStr);
            } catch {
                console.error('Failed to parse placeholders JSON');
            }
        }

        // Parse AI input if present
        let aiInput: Record<string, string> = {};
        const aiInputStr = formData.get('ai_input');
        if (aiInputStr && typeof aiInputStr === 'string') {
            try {
                aiInput = JSON.parse(aiInputStr);
            } catch {
                console.error('Failed to parse ai_input JSON');
            }
        }

        // Collect file uploads (optional)
        const uploads: Record<string, { name: string; size: number; type: string }> = {};
        formData.forEach((value, key) => {
            if (value instanceof File && value.size > 0) {
                // Skip non-file fields
                if (!['product', 'code', 'email', 'placeholders', 'ai_input'].includes(key)) {
                    uploads[key] = {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                    };
                }
            }
        });

        const submission: SubmissionPayload = {
            product: product as 'CPP' | 'RAMS',
            email: email || '',
            placeholders,
            uploads,
            created_at: new Date().toISOString(),
        };

        // Only include ai_input if not empty
        if (Object.keys(aiInput).length > 0) {
            submission.ai_input = aiInput;
        }

        console.log('=== Form Submission ===');
        console.log(JSON.stringify(submission, null, 2));
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
            } else {
                console.log('Access code marked as used:', code);
            }

            // Store submission in database (if submissions table exists)
            try {
                await supabaseAdmin
                    .from('submissions')
                    .insert({
                        product: submission.product,
                        email: submission.email,
                        payload: submission,
                        created_at: submission.created_at,
                    });
                console.log('Submission stored in database');
            } catch (err) {
                console.log('Note: submissions table may not exist yet, skipping DB storage');
            }
        }

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
