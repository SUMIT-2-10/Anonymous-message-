// =============================================
// File: src/app/api/auth/[...nextauth]/option.ts
// Purpose: NextAuth.js configuration — defines how authentication works
// =============================================
//
// AUTHENTICATION STRATEGY: Credentials + JWT
// -------------------------------------------
// This app uses NextAuth's CredentialsProvider, meaning users log in with
// their own email/username + password (no OAuth providers like Google/GitHub).
//
// WHY JWT (not database sessions)?
// - JWT sessions are stateless — the token is stored in a cookie, not in a DB.
// - Each API request carries the token, so the server doesn't need a DB lookup
//   just to verify who the user is.
// - Faster for serverless environments where DB connections are expensive.
//
// FULL AUTHENTICATION FLOW:
// 1. User submits email/username + password on /sign-in page
// 2. NextAuth calls authorize() with the credentials
// 3. authorize() connects to MongoDB, finds user by email OR username
// 4. Checks if user.isVerified === true (must verify email first)
// 5. Compares submitted password with bcrypt hash stored in DB
// 6. If valid → returns the user object → NextAuth creates a JWT
// 7. jwt() callback fires → attaches _id, isVerified, isAcceptingMessages, username to token
// 8. session() callback fires → copies those fields from token into session.user
// 9. Frontend can access session.user._id, session.user.username, etc.
//
// SECURITY:
// - Passwords are NEVER stored or compared in plain text
// - bcrypt.compare() handles hash comparison securely
// - JWT is signed with NEXTAUTH_SECRET from environment variables
// - Unverified users are blocked from logging in
// =============================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
    // =============================================
    // PROVIDERS: How users can authenticate
    // =============================================
    // We use only CredentialsProvider (email/username + password).
    // You could add GoogleProvider, GitHubProvider, etc. here for OAuth.
    providers: [
        CredentialsProvider({
            id: 'credentials',       // Unique ID for this provider (used in signIn('credentials'))
            name: 'Credentials',     // Display name (shown on default NextAuth sign-in page)
            credentials: {
                // These define the fields on the default NextAuth sign-in form
                // (we use a custom form, so these are mainly for type safety)
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            // =============================================
            // authorize(): Called when a user submits credentials
            // Returns the user object if valid, or throws an error if not
            // =============================================
            async authorize(credentials: any): Promise<any> {
                // Step 1: Connect to MongoDB
                await dbConnect();
                try {
                    // Step 2: Find user by email OR username
                    // The frontend sends "identifier" which could be either
                    // $or allows matching against multiple fields
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ],
                    });

                    // Step 3: If no user found, reject authentication
                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    // Step 4: Check if the user has verified their email via OTP
                    // Unverified users should not be allowed to log in
                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }

                    // Step 5: Compare submitted password with the bcrypt hash in DB
                    // bcrypt.compare() handles the hashing internally — never compare plain text
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    // Step 6: Return user if password matches, otherwise reject
                    if (isPasswordCorrect) {
                        return user;  // This user object gets passed to the jwt() callback
                    } else {
                        throw new Error('Incorrect password');
                    }
                } catch (err: any) {
                    throw new Error(err);
                }
            },
        }),
    ],

    // =============================================
    // CALLBACKS: Customize what gets stored in JWT and session
    // =============================================
    callbacks: {
        // jwt() runs every time a JWT is created or updated
        // The `user` object is only available on FIRST sign-in (not on subsequent requests)
        async jwt({ token, user }) {
            if (user) {
                // Attach custom fields to the JWT token
                // These fields are needed throughout the app for authorization decisions
                token._id = user._id?.toString(); // Convert ObjectId to string for serialization
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },

        // session() runs every time the session is accessed (useSession(), getServerSession())
        // It copies data from the JWT token into the session object that the frontend can read
        async session({ session, token }) {
            if (token) {
                // Map JWT token fields → session.user fields
                // This is what the frontend sees when calling useSession()
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        },
    },

    // =============================================
    // SESSION STRATEGY: Use JWT (not database sessions)
    // =============================================
    session: {
        strategy: 'jwt',
        // JWT is stored as an httpOnly cookie — no DB table needed for sessions
    },

    // Secret used to sign/encrypt the JWT — MUST be set in .env
    secret: process.env.NEXTAUTH_SECRET,

    // =============================================
    // CUSTOM PAGES: Override NextAuth's default sign-in page
    // =============================================
    pages: {
        signIn: '/sign-in',  // Redirect to our custom sign-in page instead of /api/auth/signin
    },
};