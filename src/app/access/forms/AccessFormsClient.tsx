'use client';

import * as React from 'react';
import { ProductSwitcher, useLastProduct, type Product } from '@/components/forms/ProductSwitcher';
import RAMSForm from '@/components/forms/RAMSForm';
import CPPForm from '@/components/forms/CPPForm';

type AccessFormsClientProps = {
    email: string;
    code: string;
    expiresAt: string;
    /** Product from the current access code */
    codeProduct: Product;
    /** Whether user has active CPP access */
    hasCPP: boolean;
    /** Whether user has active RAMS access */
    hasRAMS: boolean;
};

export default function AccessFormsClient({
    email,
    code,
    expiresAt,
    codeProduct,
    hasCPP,
    hasRAMS,
}: AccessFormsClientProps) {
    const lastProduct = useLastProduct();

    // Determine initial selection
    const getInitialProduct = (): Product => {
        // If only one product available, use it
        if (hasCPP && !hasRAMS) return 'CPP';
        if (hasRAMS && !hasCPP) return 'RAMS';
        // If both available, prefer the code's product, then localStorage, then code's product as fallback
        if (codeProduct && (codeProduct === 'CPP' ? hasCPP : hasRAMS)) {
            return codeProduct;
        }
        if (lastProduct && (lastProduct === 'CPP' ? hasCPP : hasRAMS)) {
            return lastProduct;
        }
        return codeProduct;
    };

    const [selected, setSelected] = React.useState<Product>(getInitialProduct);

    // Format expiry date for display
    let expiryLabel = '';
    try {
        const d = new Date(expiresAt);
        expiryLabel = new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }).format(d);
    } catch {
        // parsing failed
    }

    return (
        <div className="space-y-6">
            {/* Details card */}
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-sm">
                <p className="text-white/90">
                    Code: <span className="font-mono tracking-widest">{code}</span>
                </p>
                <p className="text-white/60 truncate">Email: {email}</p>
                <p className="mt-1 text-xs text-white/50">
                    Your code is single-use
                    {expiryLabel ? (
                        <>
                            {' '}and <b>expires on {expiryLabel}</b>
                        </>
                    ) : (
                        ' and expires soon.'
                    )}
                </p>
            </div>

            {/* Product Switcher */}
            <ProductSwitcher
                hasCPP={hasCPP}
                hasRAMS={hasRAMS}
                selected={selected}
                onSelect={setSelected}
                codeProduct={codeProduct}
            />

            {/* Form */}
            {selected === 'RAMS' ? (
                <RAMSForm email={email} code={code} expiresAt={expiresAt} />
            ) : (
                <CPPForm email={email} code={code} expiresAt={expiresAt} />
            )}
        </div>
    );
}
