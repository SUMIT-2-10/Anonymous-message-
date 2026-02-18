// =============================================
// File: src/Schemas/verifySchema.ts
// Purpose: Zod validation schema for email verification (OTP)
// =============================================
//
// VERIFICATION VALIDATION RULES:
// - email: Must be a valid email format, trimmed
// - verifycode: Must be EXACTLY 6 characters (matches the 6-digit OTP)
//   → length(6) ensures users can't submit partial or extended codes
//   → trim() removes accidental whitespace from copy-paste
//
// WHY EXACTLY 6 CHARACTERS?
// - The OTP is generated as a 6-digit number (100000-999999) in the sign-up route
// - This validation ensures the submitted code matches the expected format
// - Prevents brute-force with shorter/longer codes
// =============================================

import z from "zod";

// This schema is used to validate the user verification data

export const verifySchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).trim(),
    verifycode: z.string().length(6, "Verification code must be exactly 6 characters long").trim(),
});