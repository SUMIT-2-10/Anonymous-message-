/**
 * =================================================================================================
 * FILE: route.ts
 * =================================================================================================
 *
 * @description API route for verifying a user's account with a 6-digit code.
 *
 * @layer api
 * @route POST /api/verify-code
 *
 * @purpose This endpoint handles the final step of the user registration process. It receives a
 *          username and a verification code, validates them, and marks the user's account as
 *          verified if the code is correct and has not expired.
 *
 * @request_body
 *  - `username`: The username of the user to verify.
 *  - `code`: The 6-digit verification code sent to the user's email.
 *
 * @response
 *  - **Success (200):** `{ success: true, message: "Account verified successfully" }`
 *  - **Failure (400):**
 *    - Invalid code: `{ success: false, message: "Incorrect verification code" }`
 *    - Expired code: `{ success: false, message: "Verification code has expired..." }`
 *  - **Failure (404):** `{ success: false, message: "User not found" }`
 *  - **Failure (500):** `{ success: false, message: "Error verifying code" }`
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// =================================================================================================
// ROUTE HANDLER
// =================================================================================================
/**
 * @function POST
 * @description Handles the POST request to verify a user's account.
 *
 * @param {Request} request - The incoming request object.
 *
 * @flow
 * 1. **Connect to Database:** Establishes a connection to MongoDB.
 * 2. **Parse and Validate Request Body:**
 *    - Reads the JSON body from the request.
 *    - Uses `VerifyCodeQuerySchema` to validate the `username` and `code`.
 * 3. **Find User:** Searches for a user in the database matching the decoded username.
 *    - `decodeURIComponent` is used to handle any special characters in the username that might
 *      have been URL-encoded.
 * 4. **Check User Existence:** If no user is found, returns a 404 error.
 * 5. **Validate Code and Expiry:**
 *    - `isCodeValid`: Compares the submitted code with the `verifycode` stored in the user document.
 *    - `isCodeNotExpired`: Checks if the current date is before the `verifycodeExpire` date.
 * 6. **Handle Verification Logic:**
 *    - **If Valid and Not Expired:** Sets `user.isVerified` to `true`, saves the user document,
 *      and returns a 200 success response.
 *    - **If Code is Valid but Expired:** Returns a 400 error informing the user the code has
 *      expired and they need to sign up again.
 *    - **If Code is Invalid:** Returns a 400 error for an incorrect code.
 * 7. **Generic Error Handling:** A `try...catch` block wraps the entire logic to handle any
 *    unexpected server errors, returning a 500 response.
 */
export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    // The username from the URL might be encoded
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifycode === code;
    const isCodeNotExpired = new Date(user.verifycodeExpire) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Mark user as verified
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: 'Account verified successfully' },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
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
      // Code is incorrect
      return Response.json(
        { success: false, message: 'Incorrect verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    return Response.json(
      { success: false, message: 'Error verifying user' },
      { status: 500 }
    );
  }
}