// /api/profile/defaults - Save/load user profile defaults by email
// No auth - just keyed by email address

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
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        const { data, error } = await supabaseAdmin
            .from('profile_defaults')
            .select('defaults')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = not found, which is OK
            console.error('Failed to fetch defaults:', error);
            return NextResponse.json({ error: 'Failed to fetch defaults' }, { status: 500 });
        }

        return NextResponse.json({
            defaults: data?.defaults || null,
        });
    } catch (error) {
        console.error('Profile defaults GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Upsert - insert or update
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
            console.error('Failed to save defaults:', error);
            // Don't fail silently - but also don't block form submission
            // Just log and return success to not interrupt UX
            return NextResponse.json({ success: false, error: 'Failed to save' });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile defaults POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
