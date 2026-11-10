import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

   if (hostname.startsWith('admin.')) {
    if (url.pathname === '/') {
      url.pathname = '/admin';
    } else if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
