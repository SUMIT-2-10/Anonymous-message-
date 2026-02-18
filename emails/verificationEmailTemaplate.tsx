// =============================================
// File: emails/verificationEmailTemaplate.tsx
// Purpose: React Email template for OTP verification emails
// =============================================
//
// WHAT IS REACT EMAIL?
// - A library that lets you write email templates using React/JSX syntax
// - Components like <Html>, <Body>, <Container>, <Text> map to email-safe HTML
// - Styles are passed as inline objects (email clients don't support CSS classes)
//
// HOW THIS TEMPLATE IS USED:
// 1. sendVerificationEmail() passes { otp, userName } as props
// 2. Resend's SDK renders this React component to HTML
// 3. The rendered HTML is sent as the email body
//
// TEMPLATE STRUCTURE:
// - Greeting with the user's name
// - Instruction text
// - Large, bold OTP code (blue, letter-spaced for readability)
// - Disclaimer text ("if you didn't request this...")
//
// WHY INLINE STYLES?
// - Most email clients (Gmail, Outlook) strip <style> tags and CSS classes
// - Inline styles are the only reliable way to style emails
// =============================================

import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
import * as React from "react";

// Props interface for the email template
interface EmailVerificationOTPProps {
  otp: string;       // The 6-digit OTP code to display
  userName: string;  // The user's name for the greeting
}

export const EmailVerificationOTP = ({ otp, userName }: EmailVerificationOTPProps) => (
  <Html>
    <Head />
    {/* Preview text shown in email client's inbox list (before opening the email) */}
    <Preview>Your verification code</Preview>
    <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}>
      {/* Centered card container */}
      <Container style={{ maxWidth: 480, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 32 }}>
        <Section>
          {/* Personalized greeting */}
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
            {userName ? `Hello, ${userName}!` : "Hello!"}
          </Text>
          {/* Instruction text */}
          <Text style={{ fontSize: 18, marginBottom: 16 }}>
            Use the following OTP to verify your email address:
          </Text>
          {/* The OTP code — large, blue, letter-spaced for easy reading */}
          <Text style={{ fontSize: 32, fontWeight: "bold", letterSpacing: 4, color: "#2563eb", margin: "24px 0" }}>
            {otp}
          </Text>
          {/* Security disclaimer */}
          <Text style={{ fontSize: 14, color: "#555", marginTop: 24 }}>
            If you did not request this, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailVerificationOTP;