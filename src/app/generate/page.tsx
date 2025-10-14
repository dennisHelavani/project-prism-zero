// SERVER component — no "use client"
import { readAccessCookie } from '@/lib/access';
import { cookies } from 'next/headers';
import GenerateClient from './GenerateClient';

export default async function GeneratePage() {
  const payload = await readAccessCookie(); // { email, exp } | null
  const email = payload?.email ?? null;
  const code = (await cookies()).get('hh_code')?.value ?? null; // only if you set hh_code in /api/codes/validate

  const ramsUrl = process.env.NEXT_PUBLIC_TALLY_RAMs_URL as string;
  const cppUrl  = process.env.NEXT_PUBLIC_TALLY_CPP_URL as string;

  return <GenerateClient email={email} code={code} ramsUrl={ramsUrl} cppUrl={cppUrl} />;
}
