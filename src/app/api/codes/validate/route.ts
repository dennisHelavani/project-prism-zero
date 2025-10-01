import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  latestActiveCodeForEmail,
  canonicalizeEmail,
} from '@/lib/codes';
import { setAccessCookie } from '@/lib/access';

function sha256Hex(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function normalizeCode(input: string) {
  // remove spaces/dashes, force upper-case (your generator emits A–Z 2–9)
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { ok: false, error: 'missing_fields' },
        { status: 400 }
      );
    }

    const e = canonicalizeEmail(email);
    const row = await latestActiveCodeForEmail(e);
    if (!row) {
      return NextResponse.json(
        { ok: false, error: 'no_active_code' },
        { status: 400 }
      );
    }

    const submittedHash = sha256Hex(normalizeCode(code));
    if (submittedHash !== row.code_hash) {
      return NextResponse.json(
        { ok: false, error: 'invalid_code' },
        { status: 400 }
      );
    }

    // If you want one-time codes, you can mark used here:
    // await markCodeUsed(row.id);

    await setAccessCookie(e); // HttpOnly cookie for /generate gate
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('validate error:', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
