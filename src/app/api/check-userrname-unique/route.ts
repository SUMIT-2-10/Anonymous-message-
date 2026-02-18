// =============================================
// Route: /api/check-userrname-unique
// Method: GET
// Purpose: Real-time username availability check
// =============================================
//
// FLOW:
// 1. Connect to MongoDB
// 2. Extract "username" from URL query parameters (?username=johndoe)
// 3. Validate the username using Zod (same rules as sign-up)
//    → 3-30 chars, alphanumeric + underscores only
// 4. Query DB for a VERIFIED user with this exact username
//    → If found: username is taken
//    → If not found: username is available
//
// WHY ONLY CHECK VERIFIED USERS?
// - Unverified users haven't confirmed their account yet
// - Their username should still be available for someone who actually
//   completes the verification process
//
// WHY ZOD VALIDATION ON A GET ROUTE?
// - Prevents invalid/malicious input from reaching the database
// - Ensures the same validation rules apply everywhere
// - Returns descriptive error messages to the frontend
//
// USAGE: Typically called on keypress/debounce from the sign-up form
// to show real-time feedback like "✓ Username available" or "✗ Taken"
// =============================================

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { usernameValidation } from '@/Schemas/signUpSchema';

// Create a Zod schema specifically for validating the query parameter
// Reuses the same usernameValidation rules from the sign-up schema
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  // Step 1: Connect to MongoDB
  await dbConnect();

  try {
    // Step 2: Extract the username from URL query parameters
    // e.g., /api/check-userrname-unique?username=johndoe
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get('username'),
    };

    // Step 3: Validate the username using Zod
    // safeParse returns { success: true, data } or { success: false, error }
    // Unlike parse(), it doesn't throw an exception on failure
    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log('Validation result:', result);

    if (!result.success) {
      // Extract specific username validation errors for a clear error message
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    // Step 4: Check if a VERIFIED user with this username exists
    // Only verified users "own" the username
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      // Username is taken by a verified user
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 200 }
      );
    }

    // Username is available!
    return Response.json(
      {
        success: true,
        message: 'Username is unique',
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch-all error handler
    console.error('Error checking username:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username',
      },
      { status: 500 }
    );
  }
}