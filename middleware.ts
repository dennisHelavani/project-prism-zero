// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.ACCESS_JWT_SECRET!);
const COOKIE = 'hh_access';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isGenerate = url.pathname.startsWith('/generate');

  if (!isGenerate) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/generate/:path*'],
};
