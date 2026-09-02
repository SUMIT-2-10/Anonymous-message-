/**
 * ============================================
 * FILE: src/app/(app)/layout.tsx
 * Layer: frontend/app
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * Routing: this layout wraps route segment /(app) and all nested pages under it.
 * Rendering: acts as a shared UI shell for child routes in this segment.
 * ============================================
 */

import Navbar from '@/components/Navbar';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}