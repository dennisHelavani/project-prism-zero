// lib/supabase/server.ts
import { cookies as nextCookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const createSupabaseServer = async () => {
  const cookieStore = await nextCookies(); // Next 15: async
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
