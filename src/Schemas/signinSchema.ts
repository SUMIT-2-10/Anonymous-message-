/**
 * =================================================================================================
 * FILE: signInSchema.ts
 * =================================================================================================
 *
 * @description Zod schema for validating user sign-in credentials.
 *
 * @layer schemas
 *
 * @purpose This schema provides basic validation for the data submitted on the sign-in form.
 *          It ensures that the `identifier` (username or email) and `password` are present
 *          before the credentials are passed to NextAuth for authentication.
 *
 * @note The validation here is intentionally minimal. The primary role of this schema is to
 *       ensure the presence and correct data type of the fields. The actual authentication
 *       logic (checking if the user exists, verifying the password with bcrypt) is handled
 *       securely in the `authorize` function of the NextAuth configuration.
 *
 * @see /src/app/api/auth/[...nextauth]/options.ts where the `authorize` function performs the
 *      real credential verification.
 * @see /src/app/(auth)/sign-in/page.tsx where this schema is used in the sign-in form.
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
 * @const signInSchema
 * @description Zod schema for the sign-in form.
 *
 * @field identifier
 *  - **Type:** `string`
 *  - **Purpose:** This field accepts either the user's email or their username, providing a
 *    flexible login experience. It is named `identifier` to reflect this dual purpose.
 *
 * @field password
 *  - **Type:** `string`
 *  - **Purpose:** The user's password. No length or format validation is applied here, as the
 *    raw password will be compared against a hash in the backend.
 */
export const signInSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});