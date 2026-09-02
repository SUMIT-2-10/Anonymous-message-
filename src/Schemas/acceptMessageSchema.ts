/**
 * =================================================================================================
 * FILE: acceptMessageSchema.ts
 * =================================================================================================
 *
 * @description Zod schema for validating the toggle state for accepting messages.
 *
 * @layer schemas
 *
 * @purpose This schema is used in the API route that allows a user to enable or disable
 *          their ability to receive anonymous messages. It ensures that the incoming request
 *          body contains a valid boolean value for this setting.
 *
 * @see /src/app/api/accept-messages/route.ts where this schema is used to validate the
 *      request body.
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
 * @const acceptMessageSchema
 * @description Zod schema for the message acceptance flag.
 *
 * @field acceptMessages
 *  - **Type:** `boolean`
 *  - **Validation:**
 *    - `z.boolean()`: Ensures that the value is strictly `true` or `false`.
 *  - **Why validate a boolean?**
 *    - **Type Safety:** It prevents other data types (e.g., strings like `"true"`, numbers
 *      like `1`, or `null`) from being processed, enforcing strict type conformity at the
 *      API boundary.
 *    - **Explicit Intent:** It makes the expected data contract clear. The endpoint requires a
 *      boolean, and this schema enforces it.
 */
export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});