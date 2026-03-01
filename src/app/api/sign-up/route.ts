// =============================================
// Route: /api/sign-up
// Method: POST
// Purpose: Handles new user registration
// =============================================
//
// COMPLETE SIGN-UP FLOW:
// 1. Connect to MongoDB
// 2. Parse username, email, password from request body
// 3. Check if a VERIFIED user with this username already exists
//    → If yes: reject (username taken)
// 4. Check if ANY user with this email exists
//    → If yes AND verified: reject (email already in use)
//    → If yes AND NOT verified: update their password + OTP (re-registration)
//    → If no: create a brand new user
// 5. Hash the password using bcrypt (salt rounds = 10)
// 6. Generate a 6-digit OTP (100000-999999)
// 7. Set OTP expiry to current time + 1 hour
// 8. Save user to database
// 9. Send verification email via Resend with the OTP
// 10. Return success/failure response
//
// SECURITY MEASURES:
// - Passwords are hashed with bcrypt before storage (never stored plain)
// - OTP expires after 1 hour to limit brute-force window
// - Separate checks for username and email prevent account conflicts
//
// EDGE CASE: Unverified re-registration
// - If a user signed up but never verified, they can sign up again
//   with the same email. Their password and OTP are updated in-place
//   instead of creating a duplicate account.
// =============================================

import UserModel from "@/model/User";
import bcrypt from "bcryptjs"
import connectToDB from "@/lib/dbConnect";

import { sendVerificationEmail } from "@/helpers/sendVerficationEmail";

export async function POST(request: Request) {
    // Step 1: Establish database connection (singleton — won't reconnect if already connected)
    await connectToDB();
    try {
        // Step 2: Extract registration data from the request body
        const { username, email, password } = await request.json();

        // Step 3: Check if a VERIFIED user with this username already exists
        // Only verified users "own" the username — unverified users can be overwritten
        const existingUserVerfiedByUsername = await UserModel.findOne({ username, isVerified: true})

        if (existingUserVerfiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                {
                    status: 400
                }
            )
        }

        // Step 4: Check if ANY user (verified or not) exists with this email
        const existingUserByEmail = await UserModel.findOne({ email})

        // Step 5: Generate a 6-digit OTP (range: 100000 to 999999)
        // Math.floor(100000 + Math.random() * 900000) guarantees exactly 6 digits
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified){
                // CASE A: Email belongs to a verified user → reject registration
                return Response.json({
                    success: false,
                    message: "User aleady exist wth this email"
                },{status: 400})

            }
            else{
                // CASE B: Email exists but user is NOT verified → update in-place
                // This handles the case where someone signed up but never verified
                // We update their password and OTP instead of creating a duplicate
                const hashedPassword = await bcrypt.hash(password,10)
                existingUserByEmail.password= hashedPassword,
                existingUserByEmail.verifycode = verificationCode;

                // Set OTP expiry to 1 hour from now
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);
                existingUserByEmail.verifycodeExpire = expiryDate;

                await existingUserByEmail.save();
            }
        }
        else{
            // CASE C: Completely new user → create from scratch

            // Hash password with bcrypt (10 salt rounds = good balance of security vs. speed)
            const hashedPassword = await bcrypt.hash(password, 10);

            // Set OTP expiry to 1 hour from now
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifycode: verificationCode,
                verifycodeExpire: expiryDate,
                isVerified: false,           // Must verify email before logging in
                isAcceptingMessages: false,   // Default: not accepting messages
                messages: []                  // Empty message array
            });

            await newUser.save();
        }

        // Step 9: Send verification email with the OTP code
        // Uses Resend API + React Email template
        //send verification email 
        const emailResponse = await sendVerificationEmail(email,verificationCode,username)

        // If email sending failed, return error (user is saved but can't verify)
        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        // Step 10: Success — user registered and verification email sent
        return Response.json({
            success: true,
            message: "User registered successfully. Please verify email"
        },{status: 201})

    } catch (error) {
        // Catch-all error handler for unexpected failures
        console.error("Error in sign-up route", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred during sign-up"
            },
            {
                status: 500
            }
        )

    }
}