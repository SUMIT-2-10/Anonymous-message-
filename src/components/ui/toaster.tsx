/**
 * ============================================
 * FILE: src/components/ui/toaster.tsx
 * Layer: frontend/components
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * ============================================
 */

"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
