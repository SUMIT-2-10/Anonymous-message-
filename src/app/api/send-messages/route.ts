/**
 * ============================================
 * FILE: src/app/api/send-messages/route.ts
 * Layer: backend/api
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * Route: /api/send-messages
 * Request Flow: receives request -> validates/parses input -> executes business logic -> returns JSON response.
 * Error Handling: returns explicit status codes for authentication, validation, and server failures.
 * ============================================
 */

// =============================================
// Route: /api/send-messages
// Method: POST
// Purpose: Allows ANYONE to send an anonymous message to a user
// =============================================
//
// ANONYMOUS MESSAGE FLOW:
// 1. Connect to MongoDB
// 2. Parse username and content from request body
// 3. Find the target user by username
// 4. Check if the user is accepting messages (isAcceptingMessages)
//    → If not: return 403 Forbidden
// 5. Create a new message object with content + timestamp
// 6. Push the message into the user's messages[] array (embedded subdocument)
// 7. Save the user document
//
// KEY POINTS:
// - This route does NOT require authentication
//   → Anyone can send a message if they know the username
//   → That's what makes it "anonymous"
// - Messages are stored as embedded subdocuments inside the User document
// - The recipient can toggle isAcceptingMessages to stop receiving messages
// - HTTP 403 is used when user exists but isn't accepting messages
//   (403 = server understood the request but refuses to authorize it)
// =============================================

import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/User';

export async function POST(request: Request) {
    // Step 1: Connect to MongoDB
    await dbConnect();

    // Step 2: Parse the anonymous message data
    const { username, content } = await request.json();

    try {
        // Step 3: Find the target user by username
        const user = await UserModel.findOne({ username }).exec();

        if (!user) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Step 4: Check if the user is accepting messages
        // Users can toggle this setting from their dashboard
        if (!user.isAcceptingMessages) {
            return Response.json(
                { message: 'User is not accepting messages', success: false },
                { status: 403 } // 403 Forbidden status
            );
        }

        // Step 5: Create the new message object
        // createdAt is set to the current timestamp
        const newMessage = { content, createdAt: new Date() };

        // Step 6: Push the new message into the user's embedded messages array
        // Mongoose treats this as adding a subdocument to the array
        // Push the new message to the user's messages array
        user.messages.push(newMessage as Message);

        // Step 7: Save the updated user document to persist the new message
        await user.save();

        return Response.json(
            { message: 'Message sent successfully', success: true },
            { status: 201 }  // 201 = Created (new resource was created)
        );
    } catch (error) {
        console.error('Error adding message:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}