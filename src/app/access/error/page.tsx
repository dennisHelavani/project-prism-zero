import { Suspense } from 'react';
import PageShell from '@/components/layout/page-shell';
import ErrorClient from './ErrorClient';

export default function AccessErrorPage() {
    return (
        <PageShell>
            <Suspense fallback={
                <main className="mx-auto max-w-xl px-4 pt-12 pb-24">
                    <div className="rounded-3xl border border-white/10 bg-black/30 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset,0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="p-6 sm:p-8 text-center">
                            <p className="text-white/70">Loading...</p>
                        </div>
                    </div>
                </main>
            }>
                <ErrorClient />
            </Suspense>
        </PageShell>
    );
}
