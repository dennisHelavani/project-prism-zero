import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import ThanksContent from './ThanksContent';

// Loading fallback for Suspense
function ThanksLoading() {
    return (
        <div className="text-center p-8 max-w-md bg-card rounded-xl border border-border">
            <Loader2 className="w-16 h-16 text-[#FABE2C] mx-auto mb-4 animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-muted-foreground">Please wait...</p>
        </div>
    );
}

export default function ThanksPage() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center py-20">
                <Suspense fallback={<ThanksLoading />}>
                    <ThanksContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
