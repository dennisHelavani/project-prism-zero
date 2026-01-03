// /api/profile/defaults - Save/load user profile defaults by email
// No auth - just keyed by email address
// Fails gracefully if profile_defaults table doesn't exist

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type ProfileDefaults = {
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyLogoUrl?: string;
    permits?: string[];
};

// GET /api/profile/defaults?email=...
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email')?.toLowerCase().trim();

        if (!email) {
            return NextResponse.json({ defaults: null });
        }

        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await supabaseAdmin
            .from('profile_defaults')
            .select('defaults')
            .eq('email', email)
            .single();

        // Handle any error gracefully - table might not exist
        if (error) {
            // PGRST116 = not found (expected)
            // 42P01 = table doesn't exist
            // Just return null defaults for any error
            if (error.code !== 'PGRST116') {
                console.log('Profile defaults fetch (non-critical):', error.code, error.message);
            }
            return NextResponse.json({ defaults: null });
        }

        return NextResponse.json({
            defaults: data?.defaults || null,
        });
    } catch (error) {
        // Fail gracefully - profile defaults are non-critical
        console.log('Profile defaults GET (non-critical):', error);
        return NextResponse.json({ defaults: null });
    }
}

// POST /api/profile/defaults
// Body: { email: string, defaults: ProfileDefaults }
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.toLowerCase().trim();
        const defaults: ProfileDefaults = body.defaults;

        if (!email) {
            return NextResponse.json({ success: false });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Upsert - insert or update (fails silently if table doesn't exist)
        const { error } = await supabaseAdmin
            .from('profile_defaults')
            .upsert(
                {
                    email,
                    defaults,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'email' }
            );

        if (error) {
            // Log but don't fail - this is non-critical functionality
            console.log('Profile defaults save (non-critical):', error.code, error.message);
            return NextResponse.json({ success: false });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        // Fail gracefully - profile defaults are non-critical
        console.log('Profile defaults POST (non-critical):', error);
        return NextResponse.json({ success: false });
    }
}
