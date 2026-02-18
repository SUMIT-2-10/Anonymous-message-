// =============================================
// File: src/app/api/auth/[...nextauth]/route.ts
// Purpose: NextAuth.js API route handler (catch-all)
// =============================================
//
// WHAT IS [...nextauth]?
// ----------------------
// The square brackets [...nextauth] create a "catch-all" dynamic route.
// This means ALL requests to /api/auth/* are handled by this file:
//   - /api/auth/signin     → NextAuth sign-in page/logic
//   - /api/auth/signout    → NextAuth sign-out logic
//   - /api/auth/callback/* → OAuth callback handling
//   - /api/auth/session    → Session data endpoint
//   - /api/auth/csrf       → CSRF token endpoint
//
// WHY EXPORT AS GET AND POST?
// - NextAuth needs to handle both HTTP methods:
//   - GET: Fetching session, CSRF token, sign-in page
//   - POST: Submitting credentials, signing out
// - In Next.js App Router, each HTTP method must be a named export
// - We create one handler and export it as both GET and POST
//
// The actual auth logic lives in ./option.ts (authOptions)
// This file is just the "wiring" that connects NextAuth to the route.
// =============================================

import NextAuth from 'next-auth/next';
import { authOptions } from './option';

// Create the NextAuth handler using our configuration
const handler = NextAuth(authOptions);

// Export the same handler for both GET and POST requests
export { handler as GET, handler as POST };