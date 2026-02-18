// =============================================
// File: src/Schemas/signinSchema.ts
// Purpose: Zod validation schema for user sign-in
// =============================================
//
// SIGN-IN VALIDATION:
// - identifier: Can be either email or username (flexible login)
//   → No strict format validation here because it could be either
//   → The actual email/username check happens in the NextAuth authorize() function
// - password: Basic string validation (detailed check is via bcrypt in authorize())
//
// WHY "identifier" INSTEAD OF "email"?
// - The app supports login with EITHER email or username
// - Using "identifier" as the field name makes this clear
// - The NextAuth authorize() function uses $or to check both fields
// =============================================

import z from "zod";

// This schema is used to validate the user sign-in data    

export const signInSchema = z.object({
    identifier: z.string(),//can use email instead of idenatifier
    password: z.string(),
});