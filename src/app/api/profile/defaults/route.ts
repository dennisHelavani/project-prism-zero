// /api/profile/defaults - Save/load user profile defaults by email + product
// Separate storage for CPP and RAMS defaults
// Fails gracefully if profile_defaults table doesn't exist

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/profile/defaults?email=...&product=CPP|RAMS
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email')?.toLowerCase().trim();
        const product = searchParams.get('product') || 'CPP';

        if (!email) {
            return NextResponse.json({ defaults: null });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Use composite key: email + product
        const key = `${email}:${product}`;

        const { data, error } = await supabaseAdmin
            .from('profile_defaults')
            .select('defaults')
            .eq('key', key)
            .single();

        // Handle any error gracefully - table might not exist
        if (error) {
            if (error.code !== 'PGRST116') {
                console.log('Profile defaults fetch (non-critical):', error.code, error.message);
            }
            return NextResponse.json({ defaults: null });
        }

        return NextResponse.json({
            defaults: data?.defaults || null,
        });
    } catch (error) {
        console.log('Profile defaults GET (non-critical):', error);
        return NextResponse.json({ defaults: null });
    }
}

// POST /api/profile/defaults
// Body: { email: string, product: "CPP" | "RAMS", defaults: {...} }
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.toLowerCase().trim();
        const product = body.product || 'CPP';
        const defaults = body.defaults;

        if (!email) {
            return NextResponse.json({ success: false });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Use composite key: email + product
        const key = `${email}:${product}`;

        // Upsert - insert or update (fails silently if table doesn't exist)
        const { error } = await supabaseAdmin
            .from('profile_defaults')
            .upsert(
                {
                    key,
                    email,
                    product,
                    defaults,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'key' }
            );

        if (error) {
            console.log('Profile defaults save (non-critical):', error.code, error.message);
            return NextResponse.json({ success: false });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('Profile defaults POST (non-critical):', error);
        return NextResponse.json({ success: false });
    }
}
