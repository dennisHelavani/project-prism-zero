'use client';

import * as React from 'react';
import { Lock, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export type Product = 'CPP' | 'RAMS';

type ProductSwitcherProps = {
    hasCPP: boolean;
    hasRAMS: boolean;
    selected: Product;
    onSelect: (product: Product) => void;
    /** Which product the current code is for (to show as "active code" badge) */
    codeProduct?: Product;
};

const PRODUCT_INFO = {
    CPP: {
        label: 'CPP',
        fullName: 'Construction Phase Plan',
        icon: FileText,
        checkoutUrl: '/checkout/cpp',
    },
    RAMS: {
        label: 'RAMS',
        fullName: 'Risk Assessment & Method Statement',
        icon: Shield,
        checkoutUrl: '/checkout/rams',
    },
} as const;

export function ProductSwitcher({
    hasCPP,
    hasRAMS,
    selected,
    onSelect,
    codeProduct,
}: ProductSwitcherProps) {
    const { toast } = useToast();
    const router = useRouter();

    const handleTabClick = (product: Product) => {
        const hasAccess = product === 'CPP' ? hasCPP : hasRAMS;

        if (hasAccess) {
            onSelect(product);
            // Save to localStorage for remembering preference
            try {
                localStorage.setItem('hh_last_product', product);
            } catch {
                // localStorage might be unavailable
            }
        } else {
            // Show purchase prompt toast
            const info = PRODUCT_INFO[product];
            toast({
                title: `${info.fullName} is locked`,
                description: "You don't have access to this product yet. Purchase to unlock.",
                action: (
                    <ToastAction
                        altText="Purchase"
                        onClick={() => router.push(info.checkoutUrl)}
                    >
                        Purchase
                    </ToastAction>
                ),
            });
        }
    };

    return (
        <div className="w-full">
            {/* Mobile: Full-width stacked buttons */}
            <div className="flex flex-col sm:hidden gap-2">
                {(['CPP', 'RAMS'] as const).map((product) => {
                    const info = PRODUCT_INFO[product];
                    const hasAccess = product === 'CPP' ? hasCPP : hasRAMS;
                    const isSelected = selected === product;
                    const Icon = info.icon;

                    return (
                        <button
                            key={product}
                            onClick={() => handleTabClick(product)}
                            className={cn(
                                'relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                                'ring-1',
                                isSelected
                                    ? 'bg-white text-black ring-white shadow-lg'
                                    : hasAccess
                                        ? 'bg-white/5 text-white ring-white/10 hover:bg-white/10'
                                        : 'bg-white/[.02] text-white/40 ring-white/5 cursor-not-allowed'
                            )}
                        >
                            {!hasAccess && <Lock className="w-4 h-4 mr-1" />}
                            <Icon className="w-4 h-4" />
                            <span>{info.label}</span>
                            {codeProduct === product && hasAccess && (
                                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Active
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Desktop: Segmented control */}
            <div className="hidden sm:flex items-center justify-center">
                <div className="inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
                    {(['CPP', 'RAMS'] as const).map((product) => {
                        const info = PRODUCT_INFO[product];
                        const hasAccess = product === 'CPP' ? hasCPP : hasRAMS;
                        const isSelected = selected === product;
                        const Icon = info.icon;

                        return (
                            <button
                                key={product}
                                onClick={() => handleTabClick(product)}
                                className={cn(
                                    'relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all',
                                    isSelected
                                        ? 'bg-white text-black shadow-md'
                                        : hasAccess
                                            ? 'text-white hover:bg-white/10'
                                            : 'text-white/40 cursor-not-allowed'
                                )}
                            >
                                {!hasAccess && <Lock className="w-3.5 h-3.5" />}
                                <Icon className="w-4 h-4" />
                                <span>{info.label}</span>
                                {codeProduct === product && hasAccess && (
                                    <span className="ml-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** Hook to load last used product from localStorage */
export function useLastProduct(): Product | null {
    const [lastProduct, setLastProduct] = React.useState<Product | null>(null);

    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('hh_last_product');
            if (stored === 'CPP' || stored === 'RAMS') {
                setLastProduct(stored);
            }
        } catch {
            // localStorage unavailable
        }
    }, []);

    return lastProduct;
}
