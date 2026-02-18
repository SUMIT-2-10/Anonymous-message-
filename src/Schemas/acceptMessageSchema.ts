// =============================================
// File: src/Schemas/acceptMessageSchema.ts
// Purpose: Zod validation schema for toggling message acceptance
// =============================================
//
// VALIDATION:
// - acceptMessage: Must be a boolean (true or false)
//   → true  = user is accepting anonymous messages
//   → false = user has turned off anonymous messages
//
// WHY VALIDATE A BOOLEAN?
// - Prevents non-boolean values from reaching the database
// - Ensures the API can't be called with invalid data types
//   (e.g., a string "true" instead of boolean true)
// - Type safety at the API boundary
// =============================================

import z from "zod";

// This schema is used to validate   

export const acceptMessageSchema = z.object({
   acceptMessage: z.boolean(),  // Must be true or false
});