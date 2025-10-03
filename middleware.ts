// middleware.ts (repo root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'hh_access';

// IMPORTANT: this env var must be set in your runtime (local & prod)
const SECRET = process.env.ACCESS_JWT_SECRET
  ? new TextEncoder().encode(process.env.ACCESS_JWT_SECRET)
  : null;

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;

  // Gate only the /generate section (and anything under it)
  if (!nextUrl.pathname.startsWith('/generate')) {
    return NextResponse.next();
  }

  const token = cookies.get(COOKIE_NAME)?.value;

  // If no token or missing secret, send to /access and preserve intended destination
  if (!token || !SECRET) {
    const redirectUrl = new URL('/access', nextUrl);
    redirectUrl.searchParams.set('next', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await jwtVerify(token, SECRET); // { email, exp } set by your setAccessCookie()
    return NextResponse.next();
  } catch {
    const redirectUrl = new URL('/access', nextUrl);
    redirectUrl.searchParams.set('next', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }
}

// Limit middleware to the /generate path
export const config = {
  matcher: ['/generate/:path*'],
};
