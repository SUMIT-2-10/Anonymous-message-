// =============================================
// File: src/model/User.ts
// Purpose: Mongoose schemas and models for User and Message
// =============================================
//
// ARCHITECTURE: Embedded Subdocuments
// -----------------------------------
// Instead of having a separate "Messages" collection, messages are stored
// INSIDE each User document as an array of subdocuments. This is a common
// MongoDB pattern when:
//   - Messages belong to exactly one user
//   - We always fetch messages alongside the user
//   - The subdocument array won't grow unboundedly (practical limit ~16MB per document)
//
// SCHEMA STRUCTURE:
// User
// ├── username        (unique, trimmed)
// ├── email           (unique, validated with regex)
// ├── password        (bcrypt-hashed, never stored in plain text)
// ├── verifycode      (6-digit OTP string for email verification)
// ├── verifycodeExpire (Date — OTP expires 1 hour after generation)
// ├── isVerified      (boolean — has the user verified their email?)
// ├── isAcceptingMessages (boolean — is the user accepting anonymous messages?)
// └── messages[]      (array of embedded Message subdocuments)
//     ├── content     (the anonymous message text)
//     └── createdAt   (timestamp when message was sent)
//
// WHY OTP EXPIRY?
// - OTPs without expiry are a security risk — a leaked or brute-forced code
//   could be used at any time. The 1-hour window limits the attack surface.
// - If the OTP expires, the user must sign up again to get a fresh code.
//
// HOW MESSAGE STORAGE WORKS:
// - When someone sends an anonymous message, a new Message subdocument
//   is pushed into the user's `messages` array via `user.messages.push()`.
// - Messages are retrieved using MongoDB aggregation pipeline ($unwind + $sort)
//   to return them sorted by date without modifying the schema.
// =============================================

import mongoose, { Schema, Document } from "mongoose";

// =============================================
// MESSAGE INTERFACE & SCHEMA
// =============================================
// Defines the shape of each anonymous message.
// Extends Mongoose's Document interface so we get _id, save(), etc.

// Define the Message interface and schema first, since User references it
export interface Message extends Document {
    content: string;    // The actual anonymous message text
    createdAt: Date;    // When the message was sent (auto-set to Date.now)
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: [true, "Message content is required"],
        // Custom error message shown if content is missing

    },
    createdAt: {
        type: Date,
        default: Date.now,   // Automatically sets to current timestamp when created
        required: true,
    }
});

// =============================================
// USER INTERFACE & SCHEMA
// =============================================
// Defines the main User document shape.
// Each user can receive anonymous messages and control their acceptance.

export interface User extends Document {
    username: string;           // Unique display name, used in public message URL
    email: string;              // Unique email, used for login and OTP verification
    password: string;           // bcrypt-hashed password (never plain text)
    verifycode: string;         // 6-digit OTP sent to email during sign-up
    verifycodeExpire: Date;     // Expiry time for the OTP (1 hour from generation)
    isVerified: boolean;        // Whether the user has verified their email
    isAcceptingMessages: boolean; // Toggle: can anonymous users send messages?
    messages: Message[];        // Array of embedded anonymous messages
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,      // Removes leading/trailing whitespace
        unique: true,     // Enforces uniqueness at the database level
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,     // One account per email
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"],// This regex checks for a basic email format https://regexr.com/
        // Basic email regex: must have non-whitespace + @ + non-whitespace + . + non-whitespace
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        // NOTE: This stores the bcrypt HASH, not the plain-text password
        // Hashing is done in the sign-up route before saving
    },
    verifycode: {
        type: String,
        required: [true, "Verification code is required"],
        // 6-digit numeric string (e.g., "482917")
        // Generated in the sign-up route using Math.random()
    },
    verifycodeExpire: {
        type: Date,
        required: [true, "Verification code expiration date is required"],
        // Set to current time + 1 hour during sign-up
        // Used in verify-code route to check if OTP is still valid
    },
    isVerified: {
        type: Boolean,
        default: false,
        // Starts as false → set to true after successful OTP verification
        // Users cannot log in until isVerified === true
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
        // Controls whether anonymous users can send messages
        // Toggled via the /api/accept-messages endpoint
    },
    messages: [MessageSchema],
    // Embedded subdocument array — each item follows the MessageSchema
    // New messages are pushed into this array via the /api/send-messages endpoint


})

// =============================================
// MODEL EXPORT
// =============================================
// In Next.js, hot-reloading can cause Mongoose to try re-registering the same model.
// The pattern below checks if the model already exists in mongoose.models before creating it.
// This prevents the "Cannot overwrite model once compiled" error during development.

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);
export default UserModel;