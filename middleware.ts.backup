import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for files and specific paths
  if (
    pathname.match(/\.(?:jpg|jpeg|gif|png|webp|svg|ico|css|js)$/) || // Skip image and asset files
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') // Skip the images directory entirely
  ) {
    return NextResponse.next();
  }

  // Add trailing slash for other routes
  if (!pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname += '/';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Update matcher to be more specific
    '/((?!api|_next/static|_next/image|assets|favicon.ico|images).*)',
  ],
};
