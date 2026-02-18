// =============================================
// File: src/middleware.ts
// Purpose: Route protection and authentication-based redirects
// =============================================
//
// WHAT IS MIDDLEWARE IN NEXT.JS?
// ------------------------------
// Middleware runs BEFORE any page or API route is rendered/executed.
// It intercepts every matched request and can:
//   - Redirect the user to a different page
//   - Rewrite the URL
//   - Add headers
//   - Block access entirely
//
// WHY MIDDLEWARE RUNS BEFORE PAGE LOAD:
// - It executes at the Edge (before the server processes the page)
// - This means the user NEVER sees a protected page flash before redirect
// - Much faster than checking auth inside each page component
//
// PROTECTION LOGIC:
// -----------------
// 1. LOGGED-IN users trying to visit /sign-in, /sign-up, /verify, or /
//    → Redirect them to /dashboard (they don't need these pages)
//
// 2. NOT LOGGED-IN users trying to visit /dashboard
//    → Redirect them to /sign-in (they must authenticate first)
//
// 3. All other routes → Allow through (NextResponse.next())
//
// HOW SESSION IS CHECKED:
// - getToken() from next-auth/jwt reads the JWT from the request cookie
// - If token exists → user is authenticated
// - If token is null → user is not authenticated
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// =============================================
// MATCHER CONFIG: Which routes this middleware applies to
// =============================================
// Only these routes are intercepted by the middleware.
// All other routes (like /api/*, static files) are NOT affected.
// :path* means "match all sub-paths" (e.g., /dashboard/settings)
export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  // Step 1: Extract JWT token from the request cookie
  // Returns the decoded token object if authenticated, or null if not
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Step 2: AUTHENTICATED user trying to visit public-only pages
  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  // WHY: Logged-in users don't need to see sign-in/sign-up pages
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Step 3: UNAUTHENTICATED user trying to visit protected pages
  // WHY: Dashboard requires authentication — force them to sign in
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Step 4: All other cases — allow the request through
  return NextResponse.next();
}