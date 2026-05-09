import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_PATHS = [
  '/login',
  '/auth/callback',
  '/api/report',
  '/salmos',
  '/_next',
  '/assets',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return updateSession(request).then(({ response }) => response);
  }

  const { response, user, isConfigured } = await updateSession(request);

  if (!isConfigured) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 500 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'supabase_not_configured');
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
