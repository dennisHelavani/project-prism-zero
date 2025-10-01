// lib/access.ts
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.ACCESS_JWT_SECRET!);
const COOKIE_NAME = 'hh_access';

export async function setAccessCookie(email: string, ttlHours = 6) {
  const exp = Math.floor(Date.now() / 1000) + ttlHours * 3600;

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp) // use JWT exp claim properly
    .sign(SECRET);

  const store = await cookies(); // <- await the cookie store
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlHours * 3600,
  });
}

export async function readAccessCookie() {
  const store = await cookies(); // <- await here too
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { email: string; exp: number };
  } catch {
    return null;
  }
}

export async function clearAccessCookie() {
  const store = await cookies(); // <- await here as well
  store.set({ name: COOKIE_NAME, value: '', path: '/', maxAge: 0 });
}
