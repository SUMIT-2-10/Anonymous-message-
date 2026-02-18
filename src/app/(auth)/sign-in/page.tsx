// =============================================
// File: src/app/(auth)/sign-in/page.tsx
// Purpose: Sign-in page — allows users to log in with email/username + password
// =============================================
//
// RENDERING FLOW:
// 1. User visits /sign-in (if already logged in, middleware redirects to /dashboard)
// 2. User enters email/username (identifier) and password
// 3. On submit, signIn('credentials', { identifier, password }) is called
//    → This triggers NextAuth's authorize() function in option.ts
//    → authorize() checks the DB for the user, verifies password with bcrypt
// 4. If successful → JWT is created → user is redirected to /dashboard
// 5. If failed → error message is displayed on the form
//
// CLIENT COMPONENT ('use client'):
// - Uses React hooks (useState, useRouter) for form state management
// - signIn() from next-auth/react is a client-side function
// - Needs interactivity (form submission, error display)
//
// REDIRECT BEHAVIOR:
// - redirect: false prevents NextAuth from doing a full-page redirect on error
// - Instead, we get the error in `result.error` and display it inline
// - On success, router.replace('/dashboard') does a client-side navigation
//   (replace instead of push so user can't go "back" to sign-in)
// =============================================

'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  // Form state management
  const [identifier, setIdentifier] = useState('');  // Email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');             // Error message from auth
  const [loading, setLoading] = useState(false);      // Loading state for button
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    // Prevent default form submission (page reload)
    setError('');           // Clear any previous error
    setLoading(true);       // Show loading state on button

    // Call NextAuth's signIn() with the 'credentials' provider
    // redirect: false → handle the response ourselves instead of auto-redirecting
    const result = await signIn('credentials', {
      redirect: false,
      identifier,     // Sent to authorize() as credentials.identifier
      password,        // Sent to authorize() as credentials.password
    });

    setLoading(false);

    if (result?.error) {
      // Authentication failed → display the error message
      setError(result.error);
    } else {
      // Authentication successful → navigate to dashboard
      // replace() instead of push() so user can't go "back" to sign-in
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="email@example.com or username"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
