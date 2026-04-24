import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('leadforce_session');
  const path = request.nextUrl.pathname;
  
  // Auth temporarily disabled for UI/UX testing
  /*
  if (!session && !path.startsWith('/login') && !path.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (session && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
