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

export default function ThanksContent() {
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
        let filename = `${product}-document.${format}`;
        if (contentDisposition) {
            // Match filename with or without quotes
            const match = contentDisposition.match(/filename="?([^";\s]+)"?/);
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
            <div className="text-center p-8 max-w-md">
                <CheckCircle className="w-16 h-16 text-[#FABE2C] mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
                <p className="text-muted-foreground">
                    Your {product} submission has been received.
                </p>
            </div>
        );
    }

    return (
        <div className="text-center p-8 max-w-md bg-card rounded-xl border border-border">

            {/* Pending / Generating State */}
            {(status === 'pending' || status === 'generating') && (
                <>
                    <Loader2 className="w-16 h-16 text-[#FABE2C] mx-auto mb-4 animate-spin" />
                    <h1 className="text-3xl font-bold text-white mb-2">Generating Your Documents</h1>
                    <p className="text-muted-foreground mb-4">
                        Your {product} documents are being prepared. This may take a few moments...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <span className="inline-block w-2 h-2 bg-[#FABE2C] rounded-full animate-pulse" />
                        Processing...
                    </div>
                </>
            )}

            {/* Ready State */}
            {status === 'ready' && downloadReady && (
                <>
                    <CheckCircle className="w-16 h-16 text-[#FABE2C] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Documents Ready!</h1>
                    <p className="text-muted-foreground mb-6">
                        Your {product} documents have been generated successfully.
                    </p>

                    {/* Split Button Download */}
                    <div className="relative inline-flex" ref={dropdownRef}>
                        {/* Main Download Button */}
                        <Button
                            onClick={() => handleDownload(hasPdf ? 'pdf' : 'docx')}
                            disabled={isDownloading !== null}
                            className="bg-[#FABE2C] hover:bg-[#FFD700] text-black font-semibold px-6 py-3 text-lg rounded-r-none border-r border-[#e6a825]"
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
                            className="bg-[#FABE2C] hover:bg-[#FFD700] text-black px-3 py-3 rounded-l-none"
                        >
                            <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </Button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-10">
                                {hasDocx && (
                                    <button
                                        onClick={() => handleDownload('docx')}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-secondary transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Download DOCX
                                    </button>
                                )}
                                {hasPdf && (
                                    <button
                                        onClick={() => handleDownload('pdf')}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-secondary transition-colors"
                                    >
                                        <File className="w-5 h-5 text-red-400" />
                                        Download PDF
                                    </button>
                                )}
                                {hasDocx && hasPdf && (
                                    <>
                                        <div className="border-t border-border" />
                                        <button
                                            onClick={() => handleDownload('all')}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-secondary transition-colors"
                                        >
                                            <Download className="w-5 h-5 text-[#FABE2C]" />
                                            Download All
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Format availability note */}
                    <p className="text-muted-foreground text-sm mt-4">
                        Available formats: {hasDocx && 'DOCX'}{hasDocx && hasPdf && ' • '}{hasPdf && 'PDF'}
                    </p>

                    {/* Generate Another Button */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <a
                            href="/access"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Generate Another Document
                        </a>
                    </div>
                </>
            )}

            {/* Error State */}
            {status === 'error' && (
                <>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Generation Failed</h1>
                    <p className="text-muted-foreground mb-4">
                        {error || 'Something went wrong while generating your document.'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Please contact support if this issue persists.
                    </p>
                </>
            )}

        </div>
    );
}
