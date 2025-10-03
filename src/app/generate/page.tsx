// src/app/generate/page.tsx  (SERVER component — no "use client")
import { readAccessCookie } from '@/lib/access';
import { cookies as nextCookies } from 'next/headers';
import GenerateClient from './GenerateClient';

export default async function GeneratePage() {
  // 1) Your signed access cookie (email)
  const payload = await readAccessCookie(); // { email, exp } | null
  const email = payload?.email ?? null;

  // 2) If you set an extra httpOnly cookie for the validated code (hh_code), read it here
  const jar = await nextCookies();                 // <-- await is required on Next 15
  const code = jar.get('hh_code')?.value ?? null;  // may be null if you didn't set it

  // 3) Public Tally URLs
  const ramsUrl = process.env.NEXT_PUBLIC_TALLY_RAMs_URL as string;
  const cppUrl  = process.env.NEXT_PUBLIC_TALLY_CPP_URL as string;

  return <GenerateClient email={email} code={code} ramsUrl={ramsUrl} cppUrl={cppUrl} />;
}
