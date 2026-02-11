'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ShoppingCart, HelpCircle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
    missing: {
        title: 'Missing information',
        message: 'Please enter both your email and access code.',
    },
    invalid: {
        title: 'Invalid credentials',
        message: "That email/code combination doesn't match our records. Please check and try again.",
    },
    used: {
        title: 'Code already used',
        message: 'This access code has already been redeemed.',
    },
    expired: {
        title: 'Code expired',
        message: 'This access code has expired. Please purchase a new code or contact support.',
    },
    unknown: {
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Please try again.',
    },
};

export default function ErrorClient() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'unknown';
    const errorInfo = ERROR_MESSAGES[reason] || ERROR_MESSAGES.unknown;

    return (
        <main className="mx-auto max-w-xl px-4 pt-12 pb-24">
            <div className="rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="p-6 sm:p-8">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-red-500/10 p-4">
                            <AlertCircle className="h-10 w-10 text-red-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-semibold text-white tracking-tight text-center">
                        We couldn't verify your access
                    </h1>

                    {/* Error Message Box */}
                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <h2 className="text-sm font-medium text-red-400">{errorInfo.title}</h2>
                        <p className="mt-1 text-sm text-white/70">{errorInfo.message}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/access"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-black font-medium hover:bg-white/90 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Try again
                        </Link>
                        <Link
                            href="/#pricing"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-medium hover:bg-white/10 transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Purchase access
                        </Link>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-white/40 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-white/50">
                                    Need help? If you believe this is a mistake, please contact us at{' '}
                                    <a
                                        href="mailto:aaron@hardhatai.co"
                                        className="text-white/70 underline hover:text-white"
                                    >
                                        aaron@hardhatai.co
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
