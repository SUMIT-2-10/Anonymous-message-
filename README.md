# Mystery Message — Anonymous Messaging Platform

An anonymous messaging platform built with Next.js where users can receive anonymous messages from anyone who knows their username. Users sign up, verify their email via OTP, and manage their inbox from a personal dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Concept](#2-core-concept)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Application Flows](#5-application-flows)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Database Schema](#7-database-schema)
8. [API Routes Reference](#8-api-routes-reference)
9. [Validation Schemas (Zod)](#9-validation-schemas-zod)
10. [Email System](#10-email-system)
11. [Security Measures](#11-security-measures)
12. [Features Implemented](#12-features-implemented)
13. [Environment Variables](#13-environment-variables)
14. [Getting Started](#14-getting-started)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview

Mystery Message is a full-stack Next.js application that enables anonymous communication. Users create an account, verify their email with a one-time password (OTP), and share their unique profile link. Anyone with the link can send them anonymous messages without creating an account.

The application uses the **Next.js App Router** with a clear separation between:
- **API Routes** (`src/app/api/`) — Backend logic (REST endpoints)
- **Pages** (`src/app/(auth)/`) — Frontend UI (React components)
- **Middleware** (`src/middleware.ts`) — Route protection layer

---

## 2. Core Concept

```
┌─────────────────┐    Anonymous     ┌──────────────────┐
│  Anonymous User  │ ──────────────► │  /api/send-messages │
│  (no account)    │   sends message  │  (public endpoint)  │
└─────────────────┘                  └────────┬─────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   MongoDB User    │
                                    │   messages[] array │
                                    └────────┬─────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Registered User  │
                                    │  views on Dashboard│
                                    └──────────────────┘
```

- **Registered users** sign up, verify email, and control their anonymous inbox
- **Anonymous users** (anyone) can send messages to a registered user by username
- **Dashboard** shows received messages and toggles for accepting/rejecting new ones

---

## 3. Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js (App Router)** | Full-stack React framework (frontend + API routes) |
| **TypeScript** | Type-safe JavaScript |
| **MongoDB + Mongoose** | NoSQL database + ODM for schema modeling |
| **NextAuth.js** | Authentication (Credentials provider + JWT sessions) |
| **bcryptjs** | Password hashing (never store plain-text passwords) |
| **Zod** | Schema validation for API inputs |
| **Resend** | Transactional email API service |
| **React Email** | Email templates written as React components |
| **Tailwind CSS** | Utility-first CSS framework for styling |

---

## 4. Folder Structure

```
project1/
├── emails/
│   └── verificationEmailTemaplate.tsx   # React Email OTP template
├── src/
│   ├── app/
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.tsx                   # Root layout (wraps with AuthProvider)
│   │   ├── page.tsx                     # Home page
│   │   ├── (auth)/                      # Auth route group (no URL prefix)
│   │   │   ├── sign-in/page.tsx         # Sign-in page
│   │   │   └── sign-up/page.tsx         # Sign-up page
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   ├── option.ts            # NextAuth configuration
│   │       │   └── route.ts             # NextAuth catch-all handler
│   │       ├── sign-up/route.ts         # User registration endpoint
│   │       ├── verify-code/route.ts     # OTP verification endpoint
│   │       ├── check-userrname-unique/route.ts  # Username availability check
│   │       ├── accept-messages/route.ts # Toggle/read message acceptance
│   │       ├── send-messages/route.ts   # Send anonymous message (public)
│   │       └── get-messages/route.ts    # Fetch user's messages (auth required)
│   ├── context/
│   │   └── AuthProvider.tsx             # NextAuth SessionProvider wrapper
│   ├── helpers/
│   │   └── sendVerficationEmail.ts      # Email sending helper function
│   ├── lib/
│   │   ├── dbConnect.ts                 # Singleton MongoDB connection
│   │   └── resend.ts                    # Resend email client initialization
│   ├── model/
│   │   └── User.ts                      # Mongoose User + Message schemas
│   ├── Schemas/
│   │   ├── signUpSchema.ts              # Zod schema: registration
│   │   ├── signinSchema.ts              # Zod schema: login
│   │   ├── messageSchema.ts             # Zod schema: message content
│   │   ├── acceptMessageSchema.ts       # Zod schema: toggle acceptance
│   │   └── verifySchema.ts              # Zod schema: OTP verification
│   ├── types/
│   │   └── ApiResponse.ts              # Standard API response interface
│   └── middleware.ts                    # Route protection middleware
├── .env                                 # Environment variables (not in Git)
├── package.json
└── tsconfig.json
```

---

## 5. Application Flows

### 5.1 Sign-Up Flow

```
User fills form → POST /api/sign-up
                      │
                      ├── Check username uniqueness (verified users only)
                      ├── Check email uniqueness
                      ├── Hash password (bcrypt, 10 salt rounds)
                      ├── Generate 6-digit OTP
                      ├── Set OTP expiry (current time + 1 hour)
                      ├── Save user to MongoDB (isVerified: false)
                      └── Send OTP email via Resend
                              │
                              ▼
                      Redirect to /verify/{username}
```

**Edge Case:** If someone signs up but never verifies, they can sign up again with the same email. The existing unverified record is updated with a new password and OTP.

### 5.2 Email Verification Flow

```
User enters OTP → POST /api/verify-code
                      │
                      ├── Find user by username
                      ├── Compare submitted code with stored verifycode
                      ├── Check if verifycodeExpire > current time
                      │
                      ├── ✓ Valid + Not expired → isVerified = true → Success
                      ├── ✗ Expired → "Sign up again for new code"
                      └── ✗ Wrong code → "Incorrect verification code"
```

### 5.3 Login Flow

```
User submits credentials → signIn('credentials', {...})
                                │
                                ▼
                      NextAuth authorize()
                                │
                      ├── Connect to MongoDB
                      ├── Find user by email OR username ($or query)
                      ├── Check isVerified === true
                      ├── Compare password with bcrypt hash
                      │
                      ├── ✓ Valid → Return user → JWT created
                      │               │
                      │               ├── jwt() callback: attach _id, isVerified,
                      │               │                   isAcceptingMessages, username
                      │               │
                      │               └── session() callback: copy token data → session.user
                      │
                      └── ✗ Invalid → Error message shown on form
```

### 5.4 Anonymous Message Flow

```
Anyone (no auth needed) → POST /api/send-messages
                              │
                              ├── Find target user by username
                              ├── Check isAcceptingMessages === true
                              │     ├── ✗ false → 403 Forbidden
                              │     └── ✓ true → Continue
                              ├── Create message { content, createdAt }
                              ├── Push into user.messages[] array
                              └── Save user document
```

### 5.5 Dashboard Flow

```
User visits /dashboard
        │
        ├── Middleware checks JWT token
        │     ├── No token → Redirect to /sign-in
        │     └── Has token → Allow through
        │
        ├── GET /api/accept-messages → Read current toggle status
        ├── GET /api/get-messages → Fetch messages (sorted newest first)
        │     └── Uses MongoDB aggregation pipeline:
        │         $match → $unwind → $sort → $group
        │
        └── POST /api/accept-messages → Toggle acceptance on/off
```

---

## 6. Authentication & Authorization

### Authentication: Who are you?

- **Method:** NextAuth.js with Credentials provider
- **Strategy:** JWT (stateless, stored in httpOnly cookie)
- **Login fields:** Email OR username + password
- **Password storage:** bcrypt hash (never plain text)
- **Verification:** Users must verify email (OTP) before logging in

### Authorization: What can you do?

| Action | Auth Required? | Who Can Do It? |
|---|---|---|
| Sign up | No | Anyone |
| Verify email | No | Anyone with valid OTP |
| Sign in | No | Verified users |
| View dashboard | **Yes** | Authenticated users only |
| Toggle message acceptance | **Yes** | Authenticated users only |
| Fetch own messages | **Yes** | Authenticated users only |
| Send anonymous message | No | Anyone who knows a username |
| Check username availability | No | Anyone |

### Middleware Route Protection

```
middleware.ts runs BEFORE every matched route:

/sign-in, /sign-up, /verify, /  →  Logged in?  → Redirect to /dashboard
                                    Not logged in? → Allow through

/dashboard/*                    →  Logged in?  → Allow through
                                    Not logged in? → Redirect to /sign-in
```

---

## 7. Database Schema

### User Document

```
User {
  _id:                  ObjectId    (auto-generated by MongoDB)
  username:             String      (unique, trimmed, required)
  email:                String      (unique, regex-validated, required)
  password:             String      (bcrypt hash, required)
  verifycode:           String      (6-digit OTP, required)
  verifycodeExpire:     Date        (OTP expiry: signup time + 1 hour)
  isVerified:           Boolean     (default: false → true after OTP)
  isAcceptingMessages:  Boolean     (default: true, toggled by user)
  messages: [                       (embedded subdocument array)
    {
      _id:        ObjectId          (auto-generated)
      content:    String            (the anonymous message text)
      createdAt:  Date              (default: Date.now)
    }
  ]
}
```

**Design decision:** Messages are embedded subdocuments (not a separate collection) because:
- Messages always belong to exactly one user
- We always fetch messages alongside the user
- Simpler queries (no joins/population needed)
- Trade-off: 16MB document size limit per user

---

## 8. API Routes Reference

| Route | Method | Auth? | Purpose |
|---|---|---|---|
| `/api/sign-up` | POST | No | Register new user, send OTP email |
| `/api/verify-code` | POST | No | Verify OTP, mark user as verified |
| `/api/check-userrname-unique` | GET | No | Real-time username availability |
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler (signin, signout, session) |
| `/api/accept-messages` | POST | Yes | Update isAcceptingMessages |
| `/api/accept-messages` | GET | Yes | Read current isAcceptingMessages |
| `/api/send-messages` | POST | No | Send anonymous message to a user |
| `/api/get-messages` | GET | Yes | Fetch authenticated user's messages (sorted) |

All API responses follow the `ApiResponse` interface:
```typescript
{
  success: boolean;
  message: string;
  isAcceptingMessage?: boolean;  // only from accept-messages
  messages?: Message[];          // only from get-messages
}
```

---

## 9. Validation Schemas (Zod)

| Schema | Fields | Rules | Used In |
|---|---|---|---|
| `signUpSchema` | username, email, password | username: 3-30 chars, alphanumeric+underscore; email: valid format; password: min 8 chars | Sign-up form |
| `signinSchema` | identifier, password | Both strings (flexible: email or username) | Sign-in form |
| `messageSchema` | content | 10-1000 chars | Message submission |
| `acceptMessageSchema` | acceptMessage | Boolean only | Toggle endpoint |
| `verifySchema` | email, verifycode | Valid email; code exactly 6 chars | OTP verification |

**Why Zod?**
- Validates data at the API boundary before it reaches MongoDB
- Provides descriptive error messages for the frontend
- Prevents injection attacks and malformed data
- Type-safe — inferred TypeScript types from schemas

---

## 10. Email System

### Components

1. **Resend Client** (`src/lib/resend.ts`) — Initializes the Resend SDK with API key
2. **Email Helper** (`src/helpers/sendVerficationEmail.ts`) — Orchestrates email sending
3. **Email Template** (`emails/verificationEmailTemaplate.tsx`) — React Email component

### How OTP Email is Triggered

```
sign-up route → sendVerificationEmail(email, username, code)
                    │
                    └── resend.emails.send({
                          from: 'Acme <onboarding@resend.dev>',
                          to: user's email,
                          subject: 'Mystery Message | Your verification code',
                          react: <EmailVerificationOTP otp={code} userName={name} />
                        })
                              │
                              └── Resend renders React component → HTML → sends email
```

### Email Template Content
- Personalized greeting ("Hello, {username}!")
- Large blue OTP code (letter-spaced for readability)
- Security disclaimer ("If you didn't request this...")

---

## 11. Security Measures

| Measure | Implementation | Why It Matters |
|---|---|---|
| **Password Hashing** | bcrypt with 10 salt rounds | Passwords never stored in plain text; even if DB is leaked, passwords are safe |
| **Input Validation** | Zod schemas on every API route | Prevents injection attacks, malformed data, and oversized inputs |
| **OTP Expiry** | 1-hour window after generation | Limits brute-force window; expired codes can't be used |
| **Route Protection** | Middleware checks JWT before page load | Users never see protected pages without authentication |
| **JWT Sessions** | Signed with NEXTAUTH_SECRET | Stateless auth; tampered tokens are rejected |
| **Email Verification** | Must verify before login | Prevents fake account creation with arbitrary emails |
| **Username Uniqueness** | Only verified users "own" usernames | Unverified accounts can't squat on usernames |

---

## 12. Features Implemented

- [x] User registration with email + password
- [x] 6-digit OTP email verification (via Resend + React Email)
- [x] Login with email OR username (NextAuth Credentials)
- [x] JWT-based session management
- [x] Route protection middleware (public vs. protected pages)
- [x] Toggle anonymous message acceptance (on/off)
- [x] Send anonymous messages (no auth required)
- [x] Fetch messages sorted by date (MongoDB aggregation pipeline)
- [x] Real-time username availability check
- [x] Client-side sign-in and sign-up forms with error handling
- [x] AuthProvider context for app-wide session access
- [x] Standardized API response format

---

## 13. Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# NextAuth configuration
NEXTAUTH_SECRET=your-random-secret-string-here
NEXTAUTH_URL=http://localhost:3000

# Resend email API key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 14. Getting Started

```bash
# 1. Install dependencies
cd project1
npm install

# 2. Create .env file with your credentials (see section 13)

# 3. Run the development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 15. Future Improvements

> These are potential enhancements — none are implemented yet.

- [ ] Dashboard page with message display and toggle UI
- [ ] Delete individual messages
- [ ] Rate limiting on API routes (prevent spam)
- [ ] Public profile page (`/u/{username}`) for sending messages
- [ ] Message character count on the send form
- [ ] Resend OTP functionality (without re-registering)
- [ ] OAuth providers (Google, GitHub) alongside credentials
- [ ] User profile settings (change password, update email)
- [ ] Pagination for messages (when inbox grows large)
- [ ] Real-time message notifications (WebSocket or polling)

---

*This README documents the project as currently implemented. Last updated: February 2026.*

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
