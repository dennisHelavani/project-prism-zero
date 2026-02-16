// /api/access/download/route.ts
// Serve the generated document file for download (PDF or DOCX)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const supabaseAdmin = getSupabaseAdmin();

// Python doc-generator service URL
const DOC_GENERATOR_URL = process.env.DOCGEN_URL || 'http://localhost:8000';

if (!process.env.DOCGEN_URL) {
    console.warn(
        '⚠️  DOCGEN_URL is NOT set — falling back to http://localhost:8000. ' +
        'This WILL fail in production. Set DOCGEN_URL in your environment variables.'
    );
}

export async function GET(req: NextRequest) {
    const submissionId = req.nextUrl.searchParams.get('id');
    const format = req.nextUrl.searchParams.get('format') || 'docx'; // 'pdf' or 'docx'

    if (!submissionId) {
        return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 });
    }

    if (format !== 'pdf' && format !== 'docx') {
        return NextResponse.json({ error: 'Invalid format. Use "pdf" or "docx"' }, { status: 400 });
    }

    try {
        // Fetch submission to get file path
        const { data, error } = await supabaseAdmin
            .from('submissions')
            .select('id, product, outputs')
            .eq('id', submissionId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        const outputs = data.outputs as Record<string, unknown> | null;
        const docxPath = outputs?.docx_path as string | undefined;
        const pdfPath = outputs?.pdf_path as string | undefined;

        // Determine which file to serve
        const filePath = format === 'pdf' ? pdfPath : docxPath;

        if (!filePath) {
            return NextResponse.json({ error: `${format.toUpperCase()} not available` }, { status: 404 });
        }

        // Fetch file from Python service
        const downloadUrl = `${DOC_GENERATOR_URL}/download/${submissionId}?format=${format}`;
        console.log(`[docgen-download] GET ${downloadUrl}`);
        const fileRes = await fetch(downloadUrl);
        console.log(`[docgen-download] Response: ${fileRes.status} ${fileRes.statusText}`);

        if (!fileRes.ok) {
            const errBody = await fileRes.text().catch(() => '(could not read body)');
            console.error(`[docgen-download] FAILED: ${fileRes.status} - ${errBody.slice(0, 500)}`);
            return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
        }

        // Get the file buffer
        const fileBuffer = await fileRes.arrayBuffer();

        // Generate filename - clean format without underscore before extension
        const extension = format === 'pdf' ? 'pdf' : 'docx';
        const filename = `${data.product}-${submissionId.slice(0, 8)}.${extension}`;

        // Content type based on format
        const contentType = format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Return file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': String(fileBuffer.byteLength),
            },
        });
    } catch (err) {
        console.error('Download error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
