/**
 * =================================================================================================
 * FILE: route.ts
 * =================================================================================================
 *
 * @description API route for handling new user registration.
 *
 * @layer api
 * @route POST /api/sign-up
 *
 * @purpose This endpoint manages the entire user sign-up process, including validation,
 *          password hashing, user creation, and triggering the email verification flow.
 *
 * @request_body
 *  - `username`: The desired username for the new account.
 *  - `email`: The user's email address.
 *  - `password`: The user's chosen password.
 *
 * @response
 *  - **Success (201):** `{ success: true, message: "User registered successfully..." }`
 *  - **Failure (400):**
 *    - Username taken: `{ success: false, message: "Username already exists" }`
 *    - Email taken by verified user: `{ success: false, message: "User already exists with this email" }`
 *  - **Failure (500):**
 *    - Email sending failed: `{ success: false, message: "Failed to send verification email." }`
 *    - Generic server error: `{ success: false, message: "An error occurred during sign-up" }`
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { sendVerificationEmail } from '@/helpers/sendVerficationEmail';

// =================================================================================================
// ROUTE HANDLER
// =================================================================================================
/**
 * @function POST
 * @description Handles the POST request for user registration.
 *
 * @param {Request} request - The incoming request object.
 *
 * @flow
 * 1.  **Connect to Database:** Ensures a connection to MongoDB is established.
 * 2.  **Parse Request:** Reads the `username`, `email`, and `password` from the request body.
 * 3.  **Check for Existing Verified Username:**
 *     - Searches for a user who is already `isVerified` and has the same `username`.
 *     - If found, returns a 400 error because usernames must be unique for verified accounts.
 * 4.  **Check for Existing Email:**
 *     - Searches for any user with the provided `email`.
 * 5.  **Generate Verification Code:** Creates a 6-digit numeric string for email verification.
 * 6.  **Handle User Scenarios:**
 *     - **Scenario A: Email exists and is verified.**
 *       - The email is already in use by an active account. Returns a 400 error.
 *     - **Scenario B: Email exists but is not verified.**
 *       - This handles re-registration attempts. Instead of creating a new user, it updates
 *         the existing unverified user's record with the new password (hashed) and a fresh
 *         verification code and expiry date.
 *     - **Scenario C: New user.**
 *       - Hashes the provided password using `bcryptjs`.
 *       - Creates a new `UserModel` instance with the user details, hashed password,
 *         verification code, and a 1-hour expiry date.
 *       - Saves the new user to the database.
 * 7.  **Send Verification Email:**
 *     - Calls the `sendVerificationEmail` helper to send the OTP to the user's email.
 *     - If email sending fails, it returns a 500 error, as the user cannot proceed without it.
 * 8.  **Return Success Response:** If all steps are successful, returns a 201 response indicating
 *     the user was created and needs to verify their email.
 * 9.  **Error Handling:** A global `try...catch` block handles any unexpected errors during the
 *     process, returning a generic 500 error.
 */
export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken.',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email.',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifycode = verificationCode;
        existingUserByEmail.verifycodeExpire = expiryDate;
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifycode: verificationCode,
        verifycodeExpire: expiryDate,
        isVerified: false,
        isAcceptingMessages: false,
        messages: [],
      });
      await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      verificationCode,
      username
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your email.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user.',
      },
      { status: 500 }
    );
  }
}