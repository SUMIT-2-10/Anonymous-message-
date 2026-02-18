// =============================================
// File: src/lib/resend.ts
// Purpose: Initialize the Resend email client
// =============================================
//
// WHAT IS RESEND?
// - Resend is an email API service (like SendGrid, Mailgun)
// - It provides a simple SDK to send transactional emails
// - Free tier: 100 emails/day, 3000 emails/month
//
// WHY ENVIRONMENT VARIABLE?
// - RESEND_API_KEY is a secret that authenticates your app with Resend
// - Storing it in .env prevents it from being committed to Git
// - Never hardcode API keys in source code
//
// HOW IT'S USED:
// - This `resend` instance is imported in sendVerificationEmail.ts
// - Called via: resend.emails.send({ from, to, subject, react })
// =============================================

import { Resend } from 'resend';

// Create a singleton Resend client using the API key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);