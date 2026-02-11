import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const { submission_id } = await request.json();

        if (!submission_id) {
            return NextResponse.json(
                { error: 'Missing submission_id' },
                { status: 400 }
            );
        }

        console.log(`Starting document generation for submission: ${submission_id}`);

        // Path to Python script
        const docGenDir = path.join(process.cwd(), 'doc-generator');
        const pythonScript = path.join(docGenDir, 'run_generate.py');
        const pythonBin = path.join(docGenDir, 'venv', 'bin', 'python3');

        // Spawn Python process
        const result = await new Promise<{ success: boolean; data?: any; error?: string }>(
            (resolve) => {
                const process = spawn(pythonBin, [pythonScript, submission_id], {
                    cwd: docGenDir,
                });

                let stdout = '';
                let stderr = '';

                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                process.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const output = JSON.parse(stdout);
                            if (output.error) {
                                resolve({ success: false, error: output.error });
                            } else {
                                resolve({ success: true, data: output });
                            }
                        } catch (e) {
                            resolve({ success: false, error: `Invalid JSON output: ${stdout}` });
                        }
                    } else {
                        resolve({
                            success: false,
                            error: `Python process exited with code ${code}. stderr: ${stderr}`,
                        });
                    }
                });

                process.on('error', (err) => {
                    resolve({ success: false, error: `Failed to start process: ${err.message}` });
                });
            }
        );

        if (!result.success) {
            console.error('Document generation failed:', result.error);
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        console.log('Document generation completed:', result.data);

        return NextResponse.json({
            success: true,
            ...result.data,
        });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
