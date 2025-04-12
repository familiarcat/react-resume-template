import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@aws-amplify/adapter-nextjs';

/**
 * Authentication middleware for Next.js
 * 
 * This middleware checks if the user is authenticated before allowing access to protected routes.
 * It uses AWS Amplify's authentication system to verify the user's session.
 */
export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    
    // Check if the user is authenticated
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          return !!session.tokens;
        } catch {
          return false;
        }
      },
    });

    // If not authenticated, redirect to the login page
    if (!authenticated) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    return response;
  } catch (error) {
    console.error('Auth middleware error:', error instanceof Error ? error.message : 'Unknown error');
    
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
