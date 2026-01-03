'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Download, CheckCircle, AlertCircle, ChevronDown, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SubmissionStatus = 'pending' | 'generating' | 'ready' | 'error';

interface StatusResponse {
    status: SubmissionStatus;
    download_ready: boolean;
    has_pdf: boolean;
    has_docx: boolean;
    error?: string;
    product?: string;
}

export default function ThanksPage() {
    const searchParams = useSearchParams();
    const submissionId = searchParams.get('id');
    const product = searchParams.get('product') || 'Document';

    const [status, setStatus] = useState<SubmissionStatus>('pending');
    const [downloadReady, setDownloadReady] = useState(false);
    const [hasPdf, setHasPdf] = useState(false);
    const [hasDocx, setHasDocx] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Poll for status
    useEffect(() => {
        if (!submissionId) return;

        const pollStatus = async () => {
            try {
                const res = await fetch(`/api/access/status?id=${submissionId}`);
                if (!res.ok) {
                    throw new Error('Failed to check status');
                }
                const data: StatusResponse = await res.json();

                setStatus(data.status);
                setDownloadReady(data.download_ready);
                setHasPdf(data.has_pdf ?? false);
                setHasDocx(data.has_docx ?? true);

                if (data.error) {
                    setError(data.error);
                }
            } catch (err) {
                console.error('Status poll error:', err);
            }
        };

        // Initial check
        pollStatus();

        // Poll every 3 seconds until ready or error
        const interval = setInterval(() => {
            if (status !== 'ready' && status !== 'error') {
                pollStatus();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [submissionId, status]);

    const handleDownload = async (format: 'pdf' | 'docx' | 'all') => {
        if (!submissionId) return;

        setIsDownloading(format);
        setDropdownOpen(false);

        try {
            if (format === 'all') {
                // Download both files sequentially
                if (hasDocx) await downloadFile('docx');
                if (hasPdf) await downloadFile('pdf');
            } else {
                await downloadFile(format);
            }
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download file. Please try again.');
        } finally {
            setIsDownloading(null);
        }
    };

    const downloadFile = async (format: 'pdf' | 'docx') => {
        const res = await fetch(`/api/access/download?id=${submissionId}&format=${format}`);
        if (!res.ok) {
            throw new Error('Download failed');
        }

        // Get filename from Content-Disposition header or use default
        const contentDisposition = res.headers.get('Content-Disposition');
        let filename = `${product}_document.${format}`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match) filename = match[1];
        }

        // Create blob and trigger download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // If no submission ID, show generic thank you
    if (!submissionId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center p-8 max-w-md">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
                    <p className="text-slate-300">
                        Your {product} submission has been received.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center p-8 max-w-md bg-slate-800/50 rounded-xl border border-slate-700">

                {/* Pending / Generating State */}
                {(status === 'pending' || status === 'generating') && (
                    <>
                        <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin" />
                        <h1 className="text-3xl font-bold text-white mb-2">Generating Your Documents</h1>
                        <p className="text-slate-300 mb-4">
                            Your {product} documents are being prepared. This may take a few moments...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            Processing...
                        </div>
                    </>
                )}

                {/* Ready State */}
                {status === 'ready' && downloadReady && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white mb-2">Documents Ready!</h1>
                        <p className="text-slate-300 mb-6">
                            Your {product} documents have been generated successfully.
                        </p>

                        {/* Split Button Download */}
                        <div className="relative inline-flex" ref={dropdownRef}>
                            {/* Main Download Button (PDF preferred, fallback to DOCX) */}
                            <Button
                                onClick={() => handleDownload(hasPdf ? 'pdf' : 'docx')}
                                disabled={isDownloading !== null}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-r-none border-r border-green-700"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" />
                                        Download {hasPdf ? 'PDF' : 'DOCX'}
                                    </>
                                )}
                            </Button>

                            {/* Dropdown Toggle */}
                            <Button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                disabled={isDownloading !== null}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-l-none"
                            >
                                <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </Button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-xl border border-slate-600 overflow-hidden z-10">
                                    {hasDocx && (
                                        <button
                                            onClick={() => handleDownload('docx')}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-600 transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-blue-400" />
                                            Download DOCX
                                        </button>
                                    )}
                                    {hasPdf && (
                                        <button
                                            onClick={() => handleDownload('pdf')}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-600 transition-colors"
                                        >
                                            <File className="w-5 h-5 text-red-400" />
                                            Download PDF
                                        </button>
                                    )}
                                    {hasDocx && hasPdf && (
                                        <>
                                            <div className="border-t border-slate-600" />
                                            <button
                                                onClick={() => handleDownload('all')}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-slate-600 transition-colors"
                                            >
                                                <Download className="w-5 h-5 text-green-400" />
                                                Download All
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Format availability note */}
                        <p className="text-slate-400 text-sm mt-4">
                            Available formats: {hasDocx && 'DOCX'}{hasDocx && hasPdf && ' • '}{hasPdf && 'PDF'}
                        </p>
                    </>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <>
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-white mb-2">Generation Failed</h1>
                        <p className="text-slate-300 mb-4">
                            {error || 'Something went wrong while generating your document.'}
                        </p>
                        <p className="text-slate-400 text-sm">
                            Please contact support if this issue persists.
                        </p>
                    </>
                )}

            </div>
        </div>
    );
}
