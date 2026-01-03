// /api/access/status/route.ts
// Check submission status and whether downloads are ready

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

export async function GET(req: NextRequest) {
    const submissionId = req.nextUrl.searchParams.get('id');

    if (!submissionId) {
        return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('id, product, outputs')
            .eq('id', submissionId)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { status: 'error', download_ready: false, has_pdf: false, has_docx: false, error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Check outputs for file paths
        const outputs = data.outputs as Record<string, unknown> | null;
        const docxPath = outputs?.docx_path as string | undefined;
        const pdfPath = outputs?.pdf_path as string | undefined;
        const generationError = outputs?.error as string | undefined;

        if (generationError) {
            return NextResponse.json({
                status: 'error',
                download_ready: false,
                has_pdf: false,
                has_docx: false,
                error: generationError,
                product: data.product,
            });
        }

        // At least one file must exist for download to be ready
        const hasDocx = Boolean(docxPath);
        const hasPdf = Boolean(pdfPath);
        const downloadReady = hasDocx || hasPdf;

        if (downloadReady) {
            return NextResponse.json({
                status: 'ready',
                download_ready: true,
                has_pdf: hasPdf,
                has_docx: hasDocx,
                product: data.product,
            });
        }

        // Still pending
        return NextResponse.json({
            status: 'pending',
            download_ready: false,
            has_pdf: false,
            has_docx: false,
            product: data.product,
        });
    } catch (err) {
        console.error('Status check error:', err);
        return NextResponse.json(
            { status: 'error', download_ready: false, has_pdf: false, has_docx: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
