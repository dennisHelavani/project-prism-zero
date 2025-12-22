// /api/access/entitlements - Check user's product entitlements by email
// Returns which products (CPP/RAMS) the user has active access to

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email required' },
                { status: 400 }
            );
        }

        const supabaseAdmin = getSupabaseAdmin();
        const normalizedEmail = email.trim().toLowerCase();

        // Get all active (non-expired, non-used) codes for this email
        const { data: codes, error } = await supabaseAdmin
            .from('access_links')
            .select('product, expires_at, used')
            .eq('email', normalizedEmail)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString());

        if (error) {
            console.error('Entitlements query error:', error);
            return NextResponse.json(
                { error: 'Failed to check entitlements' },
                { status: 500 }
            );
        }

        // Determine which products user has access to
        const hasCPP = codes?.some((c) => c.product === 'CPP') ?? false;
        const hasRAMS = codes?.some((c) => c.product === 'RAMS') ?? false;

        // Determine default product (most recently created active code)
        let defaultProduct: 'CPP' | 'RAMS' | null = null;
        if (hasCPP && !hasRAMS) defaultProduct = 'CPP';
        else if (hasRAMS && !hasCPP) defaultProduct = 'RAMS';
        // If both, caller should use their own logic (localStorage or code param)

        return NextResponse.json({
            cpp: hasCPP,
            rams: hasRAMS,
            defaultProduct,
        });
    } catch (error) {
        console.error('Entitlements error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
