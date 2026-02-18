// =============================================
// File: src/context/AuthProvider.tsx
// Purpose: Wraps the entire app with NextAuth session context
// =============================================
//
// WHY IS THIS NEEDED?
// - NextAuth's useSession() hook needs a <SessionProvider> ancestor in the component tree
// - Without it, useSession() would return undefined everywhere
// - We wrap the ENTIRE app (in layout.tsx) so any component can access auth state
//
// 'use client' DIRECTIVE:
// - SessionProvider uses React Context (client-side feature)
// - Server Components can't use Context, so this must be a Client Component
// - This doesn't make the WHOLE app client-side — only this wrapper is
//
// RENDERING FLOW:
// layout.tsx (Server) → <AuthProvider> (Client) → <SessionProvider> → children
//
// HOW SESSION DATA FLOWS:
// 1. SessionProvider fetches session from /api/auth/session on mount
// 2. Session data (user._id, username, isVerified, etc.) becomes available
// 3. Any child component can call useSession() to read this data
// =============================================

'use client';
// This component is responsible for providing authentication context to the entire application
// It uses the SessionProvider from next-auth to manage user sessions and authentication state
// By wrapping our application with this provider, we can easily access authentication information and manage user sessions throughout the app
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SessionProvider makes useSession(), signIn(), signOut() available to all children
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}