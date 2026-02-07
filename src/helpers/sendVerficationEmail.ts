import { Resend } from "resend";
import { resend } from "@/lib/resend";

import { EmailVerificationOTP } from "../../emails/verificationEmailTemaplate";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    verifyCode: string,
    userName: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystery Message | Your verification code',
            react: EmailVerificationOTP({ otp: verifyCode, userName })
        });
        return {
            success: true,
            message: "verification email sent successfully",
        }
    } catch (error) {
        console.error("Error sending verification email", error);
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}