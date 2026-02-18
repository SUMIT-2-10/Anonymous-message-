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
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}