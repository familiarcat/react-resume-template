import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware for Next.js
 *
 * This middleware checks if the user is authenticated before allowing access to protected routes.
 * It uses cookies to verify the user's session.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the authentication token from cookies
    const authToken = request.cookies.get('auth-token')?.value;

    // If no token is present, redirect to the login page
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // In a real implementation, you would verify the token here
    // For now, we'll just check if it exists
    const isValidToken = !!authToken;

    if (!isValidToken) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // If authenticated, continue to the requested page
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:',
      error instanceof Error ? error.message : 'Unknown error');

    // Redirect to the login page on error
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// Configure which routes require authentication
export const config = {
  matcher: [
    '/protected/:path*',
    '/api/:path*',
  ]
};
