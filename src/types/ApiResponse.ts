// =============================================
// File: src/types/ApiResponse.ts
// Purpose: TypeScript interface for standardized API responses
// =============================================
//
// WHY A STANDARD RESPONSE INTERFACE?
// - Every API route returns a consistent shape
// - Frontend can reliably check `response.success` for any API call
// - Optional fields allow flexibility:
//   → isAcceptingMessage: only returned by /api/accept-messages
//   → messages: only returned by /api/get-messages
//
// USAGE EXAMPLE:
//   { success: true, message: "User registered successfully" }
//   { success: false, message: "Username already taken" }
//   { success: true, message: "Messages fetched", messages: [...] }
// =============================================

import { Message } from "@/model/User";

export interface ApiResponse {
    success: boolean;              // true if the operation succeeded, false otherwise
    message: string;               // Human-readable status/error message
    isAcceptingMessage?: boolean;  // Optional: used by accept-messages route
    messages?: Message[];          // Optional: used by get-messages route

}