// =============================================
// File: src/Schemas/signUpSchema.ts
// Purpose: Zod validation schema for user registration
// =============================================
//
// WHY VALIDATION IS CRITICAL BEFORE DB INTERACTION:
// - Prevents malicious input (SQL/NoSQL injection, XSS payloads)
// - Ensures data integrity before it reaches MongoDB
// - Provides clear, user-friendly error messages
// - Reduces unnecessary database queries (reject bad data early)
//
// SECURITY RISKS PREVENTED:
// - Username injection: regex restricts to alphanumeric + underscores
// - Excessively long inputs: max length prevents buffer overflow/DoS
// - Invalid emails: email() checks format before DB storage
// - Weak passwords: min 8 chars makes brute-force harder
//
// usernameValidation is exported separately because it's also used
// in the /api/check-userrname-unique route for real-time validation.
// =============================================

import z from "zod"

//these is schema is used to validate the user sign up data

// USERNAME RULES:
// - Minimum 3 characters (prevent meaningless names like "ab")
// - Maximum 30 characters (keep URLs and displays clean)
// - Only letters, numbers, underscores (safe for URLs and display)
// - Trimmed (remove accidental whitespace)
export const usernameValidation = z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .trim()

// COMPLETE SIGN-UP SCHEMA:
// Combines username validation with email and password rules
export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: "Invalid email address" }).trim(),  // Must be valid email format
    password: z.string()
        .min(8, "Password must be at least 8 characters long")  // Minimum length for security

})