/**
 * =================================================================================================
 * FILE: verifySchema.ts
 * =================================================================================================
 *
 * @description Zod schema for validating the email verification code (OTP).
 *
 * @layer schemas
 *
 * @purpose This schema ensures that the verification code submitted by a user during the email
 *          verification process is in the correct format before it is processed by the API.
 *          This prevents invalid or malformed data from reaching the backend logic.
 *
 * @see /src/app/api/verify-code/route.ts where this schema is used to validate the request body.
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
 * @const verifySchema
 * @description Zod schema for the verification code.
 *
 * @field verifycode
 *  - **Type:** `string`
 *  - **Validation:**
 *    - `.length(6, ...)`: Ensures the code is exactly 6 characters long, matching the length of
 *      the generated OTP. This is a critical security and data integrity check.
 *    - `.trim()`: This method is commented out as `length` should be the final check. Zod
 *      pipelines execute in order, so trimming should happen before length validation if needed,
 *      but for a fixed-length code, it's often omitted.
 */
export const verifySchema = z.object({
  verifycode: z.string().length(6, 'Verification code must be exactly 6 characters long').trim(),
});