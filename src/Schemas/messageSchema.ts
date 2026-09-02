/**
 * =================================================================================================
 * FILE: messageSchema.ts
 * =================================================================================================
 *
 * @description Zod schema for validating the content of an anonymous message.
 *
 * @layer schemas
 *
 * @purpose This schema is used when a user sends a message to another user. It ensures that the
 *          message content meets certain criteria (e.g., length) before it is stored in the
 *          database. This helps maintain data quality and prevent abuse.
 *
 * @see /src/app/api/send-messages/route.ts where this schema is used to validate the incoming
 *      message content.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { z } from 'zod';

// =================================================================================================
// SCHEMA
// =================================================================================================
/**
 * @const messageSchema
 * @description Zod schema for the message content.
 *
 * @field content
 *  - **Type:** `string`
 *  - **Validation:**
 *    - `.min(10, ...)`: Sets a minimum length of 10 characters.
 *      - **Why?** This discourages low-effort or spammy messages (e.g., "hi"), prompting
 *        senders to provide more meaningful content.
 *    - `.max(1000, ...)`: Sets a maximum length of 1000 characters.
 *      - **Why?** This prevents overly long messages that could clutter the UI or be used for
 *        abuse. It also helps manage the overall size of the parent `User` document, as
 *        messages are embedded.
 */
export const messageSchema = z.object({
  content: z
    .string()
    .min(10, 'Content cannot be empty ')
    .max(1000, 'Content is too long'),
});