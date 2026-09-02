/**
 * =================================================================================================
 * FILE: verificationEmailTemplate.tsx
 * =================================================================================================
 *
 * @description A React Email template for sending a one-time password (OTP) for email verification.
 *
 * @layer email
 *
 * @purpose This component defines the visual structure and content of the verification email.
 *          It receives the user's name and the OTP as props and renders them into a
 *          professionally styled HTML email body.
 *
 * @see https://react.email/ for documentation on creating email templates with React.
 * @see /src/helpers/sendVerficationEmail.ts where this template is imported and used by Resend.
 *
 * @notes - Inline styles are used exclusively because most email clients strip out `<style>` tags
 *          and external or embedded CSS, making inline styles the most reliable method for
 *          styling emails.
 *        - The structure is kept simple using basic HTML elements wrapped in React Email
 *          components to ensure maximum compatibility across different email clients.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// =================================================================================================
// PROPS INTERFACE
// =================================================================================================
/**
 * @interface EmailVerificationOTPProps
 * @description Defines the props required by the email template.
 *
 * @property {string} userName - The recipient's username, used for a personalized greeting.
 * @property {string} otp - The 6-digit one-time password for verification.
 */
interface EmailVerificationOTPProps {
  userName: string;
  otp: string;
}

// =================================================================================================
// COMPONENT
// =================================================================================================
/**
 * @function EmailVerificationOTP
 * @description The main React component for the verification email.
 *
 * @param {EmailVerificationOTPProps} props - The component props.
 * @returns {React.ReactElement} The rendered email template.
 *
 * @logic
 * 1. **Root Structure (`<Html>`, `<Head>`, `<Body>`):** Sets up the basic HTML document structure.
 *    - `<Preview>` provides a short summary text that appears in the user's inbox next to the
 *      subject line, offering context before the email is opened.
 * 2. **Container (`<Container>`):** Acts as a centered wrapper for the email content, ensuring
 *    it looks clean and is easy to read on various screen sizes.
 * 3. **Content Section (`<Section>`):** Holds the main body of the email.
 *    - **Greeting (`<Text>`):** A personalized welcome message to the user.
 *    - **Instruction (`<Text>`):** Informs the user about the purpose of the OTP.
 *    - **OTP Display (`<Text>`):** The OTP is displayed in a large, bold, and easily readable
 *      format to make it stand out.
 *    - **Disclaimer (`<Text>`):** A security note for users who might have received the email
 *      by mistake, assuring them they can ignore it.
 */
export const EmailVerificationOTP = ({
  userName,
  otp,
}: EmailVerificationOTPProps) => (
  <Html>
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={section}>
          <Text style={heading}>{userName ? `Hello, ${userName}!` : 'Hello!'}</Text>
          <Text style={paragraph}>
            Use the following OTP to verify your email address:
          </Text>
          <Text style={otpText}>{otp}</Text>
          <Text style={paragraph}>
            If you did not request this code, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailVerificationOTP;

// =================================================================================================
// STYLES
// =================================================================================================
// Note: These are plain JavaScript objects used for inline styling.

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  padding: '32px',
};

const section: React.CSSProperties = {
  padding: '0 24px',
};

const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '8px',
  color: '#333333',
};

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#555555',
  marginTop: '16px',
};

const otpText: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  color: '#2563eb',
  margin: '24px 0',
  textAlign: 'center',
};