/**
 * =================================================================================================
 * FILE: signUpSchema.ts
 * =================================================================================================
 *
 * @description Zod schemas for validating user registration data.
 *
 * @layer schemas
 *
 * @purpose This file defines the validation rules for the sign-up process. It ensures that
 *          data such as username, email, and password conforms to the required format and
 *          constraints before being processed by the application. This is a critical step for
 *          security and data integrity.
 *
 * @note The `usernameValidation` is exported separately because it is reused in the
 *       `/api/check-username-unique` route for real-time feedback on the sign-up form.
 *
 * @see /src/app/api/sign-up/route.ts where `signUpSchema` is used.
 * @see /src/app/api/check-username-unique/route.ts where `usernameValidation` is used.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { z } from 'zod';

// =================================================================================================
// USERNAME VALIDATION SCHEMA
// =================================================================================================
/**
 * @const usernameValidation
 * @description A reusable Zod schema for validating usernames.
 *
 * @validations
 *  - `.string()`: Ensures the input is a string.
 *  - `.min(3, ...)`: Enforces a minimum length of 3 characters to prevent overly short or
 *    meaningless usernames.
 *  - `.max(30, ...)`: Enforces a maximum length of 30 characters to keep usernames concise and
 *    display-friendly.
 *  - `.regex(/^[a-zA-Z0-9_]+$/, ...)`: Restricts the username to alphanumeric characters and
 *    underscores. This prevents special characters that could cause issues in URLs or be used
 *    for injection attacks.
 *  - `.trim()`: Removes any leading or trailing whitespace, which is a common source of user
 *    input error.
 */
export const usernameValidation = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be at most 30 characters long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .trim();

// =================================================================================================
// SIGN-UP SCHEMA
// =================================================================================================
/**
 * @const signUpSchema
 * @description The complete Zod schema for the user sign-up form.
 *
 * @field username
 *  - Reuses the `usernameValidation` schema for consistency.
 *
 * @field email
 *  - `.string().email(...)`: Validates that the input is a string and conforms to a standard
 *    email format.
 *
 * @field password
 *  - `.string().min(8, ...)`: Enforces a minimum password length of 8 characters. This is a
 *    basic security measure to discourage weak passwords. In a real-world application, more
 *    complex rules (e.g., requiring numbers, symbols) might be added.
 */
export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: 'Invalid email address' }).trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});