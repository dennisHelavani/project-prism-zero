import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filePath = searchParams.get('path');
        const format = searchParams.get('format') || 'docx';

        if (!filePath) {
            return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }

        // Security: Only allow files from output directory
        const outputDir = path.join(process.cwd(), 'doc-generator', 'output');
        const absolutePath = path.resolve(filePath);

        if (!absolutePath.startsWith(outputDir)) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
        }

        if (!fs.existsSync(absolutePath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(absolutePath);

        const contentType = format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
