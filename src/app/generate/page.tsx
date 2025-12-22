// SERVER component — no "use client"
import { readAccessCookie } from '@/lib/access';
import { cookies } from 'next/headers';
import GenerateClient from './GenerateClient';

export default async function GeneratePage() {
  const payload = await readAccessCookie(); // { email, exp } | null
  const email = payload?.email ?? null;
  const code = (await cookies()).get('hh_code')?.value ?? null;

  return <GenerateClient email={email} code={code} />;
}
