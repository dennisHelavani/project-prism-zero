// src/app/api/codes/admin-issue/route.ts
import { NextResponse } from 'next/server';
import {
  upsertCustomerByEmail,
  saveMonthlyCode,
  generateCode,
  addDaysUTC,
  monthKeyISO,
} from '@/lib/codes';

export async function POST(req: Request) {
  const hdr = req.headers.get('x-admin-secret');
  if (hdr !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { email, days = 30 } = await req.json();
  if (!email) return NextResponse.json({ error: 'email_required' }, { status: 400 });

  const customer = await upsertCustomerByEmail(email);
  const code = generateCode(8);
  const expires = addDaysUTC(days);
  const bucket = monthKeyISO(new Date()); // current month bucket (required by your schema)

  await saveMonthlyCode(customer.id, code, expires, bucket);

  return NextResponse.json({ ok: true, email, code, expiresAt: expires.toISOString() });
}
