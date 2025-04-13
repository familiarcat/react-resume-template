/**
 * Next.js Middleware
 * 
 * This middleware handles authentication and other request processing
 * for the Next.js application.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/admin',
  '/api/protected'
];

// Define authentication routes
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];

// Middleware function
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/public') ||
    pathname.includes('.')
  ) {
    return response;
  }
  
  try {
    // Check if the user is authenticated
    const isAuthenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          return !!session.tokens;
        } catch {
          return false;
        }
      }
    });
    
    // Handle protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
      }
      return response;
    }
    
    // Handle auth routes (redirect to dashboard if already authenticated)
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }
    
    // For all other routes, just continue
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // For API routes, return an error response
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // For other routes, continue (but log the error)
    return response;
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files with extensions (.svg, .jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)'
  ]
};
