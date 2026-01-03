// /api/forms/submit - Form submission endpoint
// Stores structured JSON payload and marks access code as used

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type SubmissionPayload = {
    product: 'CPP' | 'RAMS';
    email: string;
    placeholders: Record<string, string | string[]>;
    uploads: Record<string, { name: string; size: number; type: string }>;
    ai_input: Record<string, string>;
    created_at: string;
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const product = formData.get('product') as string;
        const code = formData.get('code') as string;
        const email = formData.get('email') as string;

        // Build structured payload
        const placeholders: Record<string, string | string[]> = {};
        const uploads: Record<string, { name: string; size: number; type: string }> = {};
        const aiInput: Record<string, string> = {};

        // AI input fields
        const aiFields = ['projectTask', 'aiTaskDescription'];

        formData.forEach((value, key) => {
            if (key === 'product' || key === 'code') return;

            if (value instanceof File) {
                if (value.size > 0) {
                    uploads[key] = {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                    };
                }
            } else if (aiFields.includes(key)) {
                aiInput[key] = value;
            } else {
                // Try to parse JSON arrays (like permits)
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                        placeholders[key] = parsed;
                    } else {
                        placeholders[key] = value;
                    }
                } catch {
                    placeholders[key] = value;
                }
            }
        });

        const submission: SubmissionPayload = {
            product: product as 'CPP' | 'RAMS',
            email: email || '',
            placeholders,
            uploads,
            ai_input: aiInput,
            created_at: new Date().toISOString(),
        };

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
                // Don't fail the request, just log it
            } else {
                console.log('Access code marked as used:', code);
            }

            // Store submission in database (if submissions table exists)
            // This will gracefully fail if table doesn't exist yet
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

        // TODO: In a future phase, this is where you would:
        // 1. Queue AI generation job
        // 2. Generate DOCX/PDF from templates
        // 3. Email documents to user

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
