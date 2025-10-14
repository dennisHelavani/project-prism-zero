// app/api/auth/ping/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServer(); // <- add await
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({ ok: true, user: !!user });
}
