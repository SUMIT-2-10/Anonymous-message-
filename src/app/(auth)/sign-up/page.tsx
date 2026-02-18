// =============================================
// File: src/app/(auth)/sign-up/page.tsx
// Purpose: Sign-up page — allows new users to register
// =============================================
//
// RENDERING FLOW:
// Client → API → DB → Response → UI Update
//
// 1. User visits /sign-up (if already logged in, middleware redirects to /dashboard)
// 2. User fills in username, email, and password
// 3. On submit, a POST request is sent to /api/sign-up with the form data
// 4. The API route:
//    a. Checks username uniqueness (only verified users count)
//    b. Checks email uniqueness
//    c. Hashes password with bcrypt
//    d. Generates 6-digit OTP
//    e. Saves user to MongoDB
//    f. Sends verification email via Resend
// 5. If successful → redirect to /verify/{username} for OTP entry
// 6. If failed → display error message on the form
//
// CLIENT COMPONENT ('use client'):
// - Uses React hooks (useState, useRouter) for form state management
// - Uses fetch() for API communication
// - Needs interactivity (form submission, error display, loading states)
//
// NAVIGATION:
// - On success: router.replace(`/verify/${username}`) takes user to verification page
// - Link to /sign-in for users who already have an account
// =============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  // Form state management
  const [username, setUsername] = useState('');    // Unique username
  const [email, setEmail] = useState('');          // Email for verification
  const [password, setPassword] = useState('');    // Password (min 8 chars)
  const [error, setError] = useState('');           // Error message from API
  const [loading, setLoading] = useState(false);    // Loading state for button
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    // Prevent default form submission
    setError('');           // Clear previous errors
    setLoading(true);       // Show loading state

    try {
      // Send registration data to the sign-up API endpoint
      const res = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        // Registration failed → display the error message from API
        setError(data.message);
      } else {
        // Registration successful → redirect to OTP verification page
        // The username is passed in the URL so the verify page knows who to verify
        router.replace(`/verify/${username}`);
      }
    } catch {
      // Network or unexpected error
      setError('Something went wrong');
    } finally {
      // Always reset loading state, whether success or failure
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
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
              minLength={8}
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
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
