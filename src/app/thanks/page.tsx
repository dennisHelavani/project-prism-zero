import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ThanksContent from './ThanksContent';

// Loading fallback for Suspense
function ThanksLoading() {
    return (
        <div className="text-center p-8 max-w-md bg-slate-800/50 rounded-xl border border-slate-700">
            <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-slate-300">Please wait...</p>
        </div>
    );
}

export default function ThanksPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <Suspense fallback={<ThanksLoading />}>
                <ThanksContent />
            </Suspense>
        </div>
    );
}
