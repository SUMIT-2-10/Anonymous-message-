/**
 * =================================================================================================
 * FILE: resend.ts
 * =================================================================================================
 *
 * @description Initializes and exports a singleton instance of the Resend client.
 *
 * @layer lib
 *
 * @purpose This module provides a single, shared instance of the Resend client for the entire
 *          application. By initializing it here, we avoid creating multiple instances and ensure
 *          that the Resend API key is loaded from a central, secure location (environment
 *          variables).
 *
 * @how_it_works
 * 1. It imports the `Resend` class from the `resend` package.
 * 2. It creates a new instance of `Resend`, passing the `RESEND_API_KEY` from `process.env`.
 * 3. The instance is exported as a named constant `resend`.
 *
 * @security It is critical to store the `RESEND_API_KEY` in an environment file (e.g., `.env.local`)
 *           and not hardcode it. This prevents the secret key from being exposed in the
 *           git repository.
 *
 * @see /src/helpers/sendVerificationEmail.ts where this `resend` instance is used to send emails.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { Resend } from 'resend';

// =================================================================================================
// INSTANTIATION
// =================================================================================================
/**
 * @constant {Resend} resend
 * @description A singleton instance of the Resend client.
 *
 * This instance is configured with the API key found in the `RESEND_API_KEY` environment
 * variable. It will be used throughout the application for all email-sending operations.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);