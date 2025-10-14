export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  upsertCustomerByEmail,
  saveMonthlyCode,
  generatePlainCode,
  addUtcDays,
  monthKeyUtc,
} from '@/lib/codes';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'email_required' }, { status: 400 });

  const customer = await upsertCustomerByEmail(email);
  const code = generatePlainCode(8);
  const expires = addUtcDays(30);
  const mkey = monthKeyUtc(new Date());

  await saveMonthlyCode(customer.id, code, expires, mkey);

  return NextResponse.json({
    ok: true,
    email,
    code,
    expiresAt: expires.toISOString(),
  });
}
