import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// Middleware
// ============================================================================

export async function middleware(request: NextRequest) {
  // Pass through all requests - auth is handled client-side via Supabase
  return NextResponse.next();
}

// ============================================================================
// Matcher Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
