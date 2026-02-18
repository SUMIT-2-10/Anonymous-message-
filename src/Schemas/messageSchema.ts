// =============================================
// File: src/Schemas/messageSchema.ts
// Purpose: Zod validation schema for anonymous messages
// =============================================
//
// MESSAGE VALIDATION RULES:
// - content: Must be between 10 and 1000 characters
//   → Min 10: Prevents meaningless/spam messages like "hi" or "lol"
//   → Max 1000: Prevents excessively long messages that could:
//     - Slow down the database (embedded subdocuments add to document size)
//     - Cause UI overflow issues on the dashboard
//     - Be used for DoS attacks (filling storage with huge messages)
//
// SECURITY RISKS PREVENTED:
// - Empty/near-empty spam messages
// - Storage abuse via extremely long messages
// - MongoDB document size limit (16MB) protection
// =============================================

import z from "zod";

// This schema is used to validate   

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, "Content cannot be empty ")    // Reject messages shorter than 10 chars
        .max(1000, "Content is too long"),       // Reject messages longer than 1000 chars
});