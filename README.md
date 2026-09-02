# Mystery Message - Project Documentation

This README documents the project as it is currently implemented.
It is written as revision-style documentation for beginners.

## 1. Project Overview

Mystery Message is an anonymous messaging platform built with Next.js App Router.
Registered users can:
- create an account
- verify email with OTP
- log in
- control whether they accept anonymous messages
- view and delete received messages from dashboard

Anyone with a user's public profile link can send an anonymous message (without creating an account).

## 2. Tech Stack Explanation

### Next.js (App Router)
- Handles both frontend pages and backend API routes in one codebase.
- Uses route groups like `(auth)` and `(app)` to organize UI routes.
- API routes live in `src/app/api/*`.

### NextAuth
- Handles login and session management.
- Uses Credentials provider (identifier + password), not OAuth.
- Uses JWT session strategy.
- Session user is extended with custom fields like `_id`, `username`, and message settings.

### Resend
- Sends transactional emails.
- Used during sign-up to send OTP verification code.
- Resend client is initialized in `src/lib/resend.ts` and used through a helper.

### React Email
- OTP email template is written as React component in `emails/verificationEmailTemaplate.tsx`.
- The template receives dynamic props (`otp`, `userName`) and is rendered by Resend.

### Zod
- Validates form and API input schemas.
- Prevents malformed input before database logic runs.
- Used for sign-up, sign-in, verify-code, message input, and acceptance-toggle validation.

### bcrypt (bcryptjs)
- Hashes password during sign-up.
- Compares plain password with hash during sign-in (NextAuth authorize callback).
- Ensures passwords are never stored in plain text.

## 3. Folder Structure Explanation

```text
project1/
  emails/
    verificationEmailTemaplate.tsx     # React Email OTP template

  src/
    app/
      layout.tsx                        # Root app layout + AuthProvider wrapper
      globals.css

      (auth)/
        sign-in/page.tsx
        sign-up/page.tsx
        verify/[username]/page.tsx

      (app)/
        layout.tsx                      # Shared app-shell layout (Navbar)
        page.tsx                        # Home/landing page
        dashboard/page.tsx              # User dashboard

      u/[username]/page.tsx             # Public profile: send anonymous message

      api/
        auth/[...nextauth]/option.ts    # NextAuth config
        auth/[...nextauth]/route.ts     # NextAuth GET/POST handler
        sign-up/route.ts
        verify-code/route.ts
        check-username-unique/route.ts
        accept-messages/route.ts
        send-messages/route.ts
        get-messages/route.ts
        delete-message/[messageid]/route.ts
        suggest-messages/route.ts

    components/
      Navbar.tsx
      MessageCard.tsx
      ui/*                              # Reusable UI primitives

    context/
      AuthProvider.tsx

    helpers/
      sendVerficationEmail.ts

    lib/
      dbConnect.ts
      resend.ts
      utils.ts

    model/
      User.ts                           # User model + embedded Message subdocument

    Schemas/
      signUpSchema.ts
      signinSchema.ts
      verifySchema.ts
      messageSchema.ts
      acceptMessageSchema.ts

    types/
      ApiResponse.ts
      next-auth.d.ts

    middleware.ts
```

## 4. Authentication Flow (Step-by-Step)

### Step 1: User registers
- Frontend submits sign-up form to `POST /api/sign-up`.

### Step 2: Zod validation
- Input is validated against sign-up constraints (username/email/password formats).

### Step 3: Password hashing
- Password is hashed with bcrypt before saving.

### Step 4: Database storage
- User is stored with:
  - `isVerified: false`
  - generated `verifycode`
  - `verifycodeExpire` (OTP expiry time)

### Step 5: Email verification via Resend
- Backend calls `sendVerificationEmail(email, verifyCode, userName)`.
- Resend renders React Email OTP template and sends message.

### Step 6: Login process
- User signs in with identifier (email or username) + password.
- NextAuth `authorize()` checks:
  - user exists
  - user is verified
  - password matches bcrypt hash

### Step 7: Session creation via NextAuth
- If valid, NextAuth creates JWT token.
- JWT callback injects custom fields.
- Session callback exposes those fields to frontend session state.

## 5. Request Lifecycle

1. Client submits request from page/form/component.
2. API route receives request (`src/app/api/*/route.ts`).
3. Input is parsed and validated (Zod where implemented).
4. Route connects to MongoDB via `dbConnect`.
5. Route performs query/update logic on `UserModel`.
6. Route returns JSON response with success/error state.
7. UI updates based on response (toasts, navigation, list updates).

## 6. Email Flow

1. Sign-up route generates OTP code.
2. Sign-up route calls email helper (`sendVerficationEmail.ts`).
3. Helper builds email body using React Email component (`verificationEmailTemaplate.tsx`).
4. Helper calls `resend.emails.send(...)`.
5. User receives OTP and uses it on verify page.

Environment variables involved:
- `RESEND_API_KEY`
- `NEXTAUTH_SECRET`
- `MONGODB_URI`

## 7. Current Features Implemented

- User sign-up
- Username uniqueness check endpoint
- OTP email sending (Resend + React Email)
- OTP verification endpoint and UI
- Credentials-based login (identifier + password)
- JWT session with custom fields
- Middleware route protection and redirect behavior
- Dashboard with:
  - accept/reject anonymous messages switch
  - fetch messages
  - refresh messages
  - delete message
  - copy public profile URL
- Public anonymous message submission page
- AI-generated suggested message prompts endpoint

## 8. Features Pending (Placeholder)

- [ ] Add feature here
- [ ] Add feature here
- [ ] Add feature here

## Notes

- This documentation describes only currently implemented code paths.
- No assumptions about unfinished features are included.
