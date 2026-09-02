/**
 * =================================================================================================
 * FILE: AuthProvider.tsx
 * =================================================================================================
 *
 * @description A client-side component that wraps the application with NextAuth's `SessionProvider`.
 *
 * @layer context
 *
 * @purpose The `useSession` hook from `next-auth/react` requires a `SessionProvider` to be present
 *          higher up in the component tree. This `AuthProvider` component serves as a dedicated
 *          wrapper for that provider. By placing this in the root layout, we make the session
 *          context available to all pages and components throughout the application.
 *
 * @rendering `'use client'` - This directive is essential. The `SessionProvider` uses React's
 *              Context API, which is a client-side feature. Therefore, any component that
 *              renders it must be a Client Component. This does not mean the entire application
 *              becomes client-rendered; it only marks this specific component and its children
 *              (in this case, `SessionProvider`) as part of the client-side bundle.
 *
 * @see /src/app/layout.tsx where this `AuthProvider` is used to wrap the main application content.
 * =================================================================================================
 */

'use client';

// =================================================================================================
// IMPORTS
// =================================================================================================
import { SessionProvider } from 'next-auth/react';

// =================================================================================================
// COMPONENT
// =================================================================================================
/**
 * @function AuthProvider
 * @description Provides the NextAuth session context to its children.
 *
 * @param {{ children: React.ReactNode }} props - The props object containing the children to be
 *        rendered within the provider.
 *
 * @returns {React.ReactElement} The `SessionProvider` wrapping the child components.
 *
 * @logic This component's sole responsibility is to render the `SessionProvider` from
 *        `next-auth/react`, passing through any `children`. This encapsulates the session
 *        setup and keeps the root layout cleaner.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}