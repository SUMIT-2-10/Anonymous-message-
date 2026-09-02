/**
 * ============================================
 * FILE: src/app/api/accept-messages/route.ts
 * Layer: backend/api
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * Route: /api/accept-messages
 * Request Flow: receives request -> validates/parses input -> executes business logic -> returns JSON response.
 * Error Handling: returns explicit status codes for authentication, validation, and server failures.
 * ============================================
 */

// =============================================
// Route: /api/accept-messages
// Methods: POST, GET
// Purpose: Toggle and read the user's message acceptance status
// =============================================
//
// WHY TWO METHODS?
// - POST: Updates isAcceptingMessages (toggle on/off)
// - GET:  Reads the current isAcceptingMessages value
// Both are in the same file because they manage the same resource.
//
// AUTHENTICATION REQUIRED:
// Both methods check for a valid NextAuth session.
// Only the authenticated user can change THEIR OWN acceptance status.
// Returns 401 if not authenticated.
//
// POST FLOW:
// 1. Connect to DB
// 2. Get session (verify user is logged in)
// 3. Extract acceptMessages boolean from request body
// 4. Update the user's isAcceptingMessages field using findByIdAndUpdate
// 5. Return success with updated user
//
// GET FLOW:
// 1. Connect to DB
// 2. Get session (verify user is logged in)
// 3. Find user by ID
// 4. Return the current isAcceptingMessages value
//
// WHY findByIdAndUpdate (POST) vs findById (GET)?
// - POST needs to modify and return the updated document ({ new: true })
// - GET only needs to read, so a simple findById is sufficient
// =============================================

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";


// =============================================
// POST: Update message acceptance status
// Body: { acceptMessages: boolean }
// =============================================
export async function POST(request: Request) {
    // Step 1: Connect to the database
    await dbConnect();

    // Step 2: Get the authenticated user's session
    // getServerSession() reads the JWT from cookies and returns session data
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    // Step 3: Reject if not authenticated
    if (!session || !session.user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }  // 401 = Unauthorized
        );
    }

    // Step 4: Extract user ID and the new acceptance value from request
    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        // Step 5: Find user by ID and update the isAcceptingMessages field
        // { new: true } returns the UPDATED document instead of the old one
        // Update the user's message acceptance status
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            // User not found
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status',
                },
                { status: 404 }
            );
        }

        // Step 6: Return success with the updated user data
        // Successfully updated message acceptance status
        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
}

// =============================================
// GET: Read current message acceptance status
// Returns: { success: boolean, isAcceptingMessages: boolean }
// =============================================
export async function GET(request: Request) {
    // Step 1: Connect to the database
    await dbConnect();

    // Step 2: Get the user session
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Step 3: Check if the user is authenticated
    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    try {
        // Step 4: Retrieve the user from the database using the ID
        const foundUser = await UserModel.findById(user._id);

        if (!foundUser) {
            // User not found
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Step 5: Return the user's current message acceptance status
        // Return the user's message acceptance status
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
}