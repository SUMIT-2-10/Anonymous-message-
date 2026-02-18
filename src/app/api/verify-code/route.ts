// =============================================
// Route: /api/verify-code
// Method: POST
// Purpose: Verifies a user's email using OTP code
// =============================================
//
// VERIFICATION FLOW:
// 1. Connect to MongoDB
// 2. Parse username and code from request body
// 3. Decode the username (in case it was URL-encoded)
// 4. Find the user by username
// 5. Check if the OTP code matches AND has not expired
//    → Valid + Not expired: Mark user as verified (isVerified = true)
//    → Valid + Expired: Reject — tell user to sign up again
//    → Invalid code: Reject — wrong code
//
// WHY OTP EXPIRY CHECK?
// - Without expiry, a leaked or brute-forced OTP could be used at any time
// - The 1-hour window (set during sign-up) limits the attack surface
// - Expired codes force the user to re-register and get a fresh OTP
//
// SECURITY:
// - OTP is compared as exact string match (not hashed, since it's short-lived)
// - Expiry comparison uses Date objects for accurate time checks
// =============================================

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';




export async function POST(request: Request) {
  // Step 1: Connect to MongoDB
  await dbConnect();

   try {
    // Step 2: Parse the verification data from the request body
    const { username, code } = await request.json();

    // Step 3: Decode URL-encoded username (e.g., "john%20doe" → "john doe")
    // This is important because the username might come from a URL parameter
    const decodedUsername = decodeURIComponent(username);

    // Step 4: Find the user by their username
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Step 5: Validate the OTP code
    // Check if the code is correct and not expired
    const isCodeValid = user.verifycode === code;
    const isCodeNotExpired = new Date(user.verifycodeExpire) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // SUCCESS: Both code matches AND is within expiry window
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // EXPIRED: Code was correct but the 1-hour window has passed
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    } else {
      // INVALID: Code does not match what's stored in the database
      // Code is incorrect
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }} catch (error) {
    // Catch-all error handler
    console.error('Error verifying code:', error);
    return Response.json(
      {
        success: false,
        message: 'Error verifying code',
      },
      { status: 500 }
    );
  }
}