import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { SESSION_COOKIE, createSessionToken } from '@/lib/session';

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trendybeauty.co';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !(process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET)) {
      return NextResponse.json({ success: false, error: 'Servidor sin configurar' }, { status: 500 });
    }

    const { email, password } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string' ||
        !safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: 'usr-1', name: 'Camila Directora de Operaciones', email: adminEmail, role: 'ADMIN' },
    });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: await createSessionToken(adminEmail),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Solicitud inválida' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  return response;
}