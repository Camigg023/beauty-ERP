import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

const PUBLIC_PATHS = ['/login', '/api/auth'];

async function hasBetterAuthSession(req: NextRequest) {
  const cookie = req.headers.get('cookie');
  if (!cookie) return false;

  try {
    const response = await fetch(new URL('/api/auth/get-session', req.url), {
      headers: { cookie },
      cache: 'no-store',
    });
    const session = await response.json();
    return Boolean(session?.user);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }
  if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  if (await hasBetterAuthSession(req)) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)'],
};