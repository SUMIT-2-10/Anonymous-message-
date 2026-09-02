/**
 * =================================================================================================
 * FILE: sendVerificationEmail.ts
 * =================================================================================================
 *
 * @description A helper function for sending a verification email using the Resend service.
 *
 * @layer helpers
 *
 * @purpose This module abstracts the logic for sending a verification email. It constructs the
 *          email using a React Email template and dispatches it via the Resend API. This keeps
 *          the email sending logic separate from the API route handlers, promoting reusability
 *          and cleaner code.
 *
 * @see /src/app/api/sign-up/route.ts where this function is called after a new user is created.
 * @see /emails/verificationEmailTemplate.tsx for the React Email component used as the template.
 * @see /src/lib/resend.ts for the Resend client initialization.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import { resend } from '@/lib/resend';
import { EmailVerificationOTP } from '../../emails/verificationEmailTemaplate';
import { ApiResponse } from '@/types/ApiResponse';

// =================================================================================================
// FUNCTION
// =================================================================================================
/**
 * @function sendVerificationEmail
 * @description Sends a verification email containing a 6-digit OTP to a user.
 *
 * @param {string} email - The email address of the recipient.
 * @param {string} verifyCode - The 6-digit OTP code for verification.
 * @param {string} userName - The username of the recipient, used for personalization.
 *
 * @returns {Promise<ApiResponse>} An object indicating the success or failure of the operation.
 *
 * @flow
 * 1. **Invoke Resend API:** Calls `resend.emails.send()` with the necessary parameters.
 *    - `from`: The sender's email address. This is a default from Resend for development.
 *    - `to`: The recipient's email address.
 *    - `subject`: The subject line of the email.
 *    - `react`: The React Email template (`VerificationEmailTemplate`) to be rendered as the
 *      email body. The `username` and `otp` are passed as props to the template.
 * 2. **Success Handling:** If the email is sent successfully, it returns a success response.
 * 3. **Error Handling:** If the Resend API call fails (e.g., due to network issues, invalid API
 *    key, or other service errors), it logs the error and returns a failure response.
 */
export async function sendVerificationEmail(
  email: string,
  verifyCode: string,
  userName: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Mystery Message | Your verification code',
      react: EmailVerificationOTP({ otp: verifyCode, userName }),
    });
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}