import { Html, Head, Preview, Body, Container, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailVerificationOTPProps {
  otp: string;
  userName: string;
}

export const EmailVerificationOTP = ({ otp, userName }: EmailVerificationOTPProps) => (
  <Html>
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" }}>
      <Container style={{ maxWidth: 480, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 32 }}>
        <Section>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
            {userName ? `Hello, ${userName}!` : "Hello!"}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>
            Use the following OTP to verify your email address:
          </Text>
          <Text style={{ fontSize: 32, fontWeight: "bold", letterSpacing: 4, color: "#2563eb", margin: "24px 0" }}>
            {otp}
          </Text>
          <Text style={{ fontSize: 14, color: "#555", marginTop: 24 }}>
            If you did not request this, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailVerificationOTP;