import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // 1) Canonical host: redirect www → apex
  const host = req.headers.get('host') || '';
  if (host.startsWith('www.')) {
    url.host = host.replace(/^www\./, '');
    return NextResponse.redirect(url, 308);
  }

  // 2) Only do auth work for /dashboard
  if (!url.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // 3) Supabase auth guard for /dashboard/*
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    url.pathname = '/login';
    return NextResponse.redirect(url, 307); // temp redirect to login
  }

  return res;
}

// Run on (almost) everything so the host redirect always triggers.
// Skip Next.js internals and common static assets.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
