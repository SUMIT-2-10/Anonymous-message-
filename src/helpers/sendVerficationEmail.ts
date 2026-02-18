// =============================================
// File: src/helpers/sendVerificationEmail.ts
// Purpose: Sends OTP verification email to newly registered users
// =============================================
//
// EMAIL SENDING FLOW:
// 1. sign-up route generates a 6-digit OTP
// 2. sign-up route calls sendVerificationEmail(email, verifyCode, userName)
// 3. This function uses the Resend SDK to send the email
// 4. The email body is rendered using React Email (EmailVerificationOTP component)
// 5. Returns { success: true/false, message: string }
//
// HOW REACT EMAIL WORKS:
// - React Email lets you write email templates as React components (JSX)
// - The `react` property in resend.emails.send() renders the component to HTML
// - This is much cleaner than writing raw HTML strings for emails
//
// WHY ENVIRONMENT VARIABLES ARE NEEDED:
// - RESEND_API_KEY: Authenticates with the Resend email service
// - Without it, resend.emails.send() will fail with an auth error
//
// NOTE: The 'from' address uses 'onboarding@resend.dev' which is a
// Resend sandbox domain. In production, you'd use your own verified domain.
// =============================================

import { Resend } from "resend";
import { resend } from "@/lib/resend";

import { EmailVerificationOTP } from "../../emails/verificationEmailTemaplate";
import { ApiResponse } from "@/types/ApiResponse";

/**
 * Sends a verification email with an OTP code to the specified email address.
 *
 * @param email     - The recipient's email address
 * @param verifyCode - The 6-digit OTP code to include in the email
 * @param userName  - The user's display name (shown in the email greeting)
 * @returns Promise<ApiResponse> - { success: boolean, message: string }
 */
export async function sendVerificationEmail(
    email: string,
    verifyCode: string,
    userName: string): Promise<ApiResponse> {
    try {
        // Send the email using Resend's SDK
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',  // Sender address (sandbox domain)
            to: email,                               // Recipient's email
            subject: 'Mystery Message | Your verification code',  // Email subject line
            react: EmailVerificationOTP({ otp: verifyCode, userName })  // React component rendered as HTML
        });
        return {
            success: true,
            message: "verification email sent successfully",
        }
    } catch (error) {
        // If Resend API fails (network error, invalid key, etc.)
        console.error("Error sending verification email", error);
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}