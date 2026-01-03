// /api/profile/defaults - Save/load user profile defaults by email + product
// Uses separate tables: profile_cpp and profile_rams
// Fails gracefully if tables don't exist

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET /api/profile/defaults?email=...&product=CPP|RAMS
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email')?.toLowerCase().trim();
        const product = searchParams.get('product')?.toUpperCase() || 'CPP';

        if (!email) {
            return NextResponse.json({ defaults: null });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Use product-specific table: profile_cpp or profile_rams
        const tableName = product === 'RAMS' ? 'profile_rams' : 'profile_cpp';

        const { data, error } = await supabaseAdmin
            .from(tableName)
            .select('defaults')
            .eq('customer_email', email)
            .single();

        // Handle any error gracefully - table might not exist
        if (error) {
            if (error.code !== 'PGRST116') {
                console.log(`Profile defaults fetch from ${tableName} (non-critical):`, error.code, error.message);
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
        const product = body.product?.toUpperCase() || 'CPP';
        const defaults = body.defaults;

        if (!email) {
            return NextResponse.json({ success: false });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Use product-specific table: profile_cpp or profile_rams
        const tableName = product === 'RAMS' ? 'profile_rams' : 'profile_cpp';

        // Upsert - insert or update on customer_email conflict
        const { error } = await supabaseAdmin
            .from(tableName)
            .upsert(
                {
                    customer_email: email,
                    defaults: defaults,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'customer_email' }
            );

        if (error) {
            console.log(`Profile defaults save to ${tableName} (non-critical):`, error.code, error.message);
            return NextResponse.json({ success: false });
        }

        console.log(`Profile defaults saved to ${tableName} for ${email}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.log('Profile defaults POST (non-critical):', error);
        return NextResponse.json({ success: false });
    }
}
