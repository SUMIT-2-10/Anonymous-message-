/**
 * ============================================
 * FILE: src/app/api/get-messages/route.ts
 * Layer: backend/api
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * Route: /api/get-messages
 * Request Flow: receives request -> validates/parses input -> executes business logic -> returns JSON response.
 * Error Handling: returns explicit status codes for authentication, validation, and server failures.
 * ============================================
 */

// =============================================
// Route: /api/get-messages
// Method: GET
// Purpose: Retrieves all messages for the authenticated user, sorted by date
// =============================================
//
// FLOW:
// 1. Connect to MongoDB
// 2. Get authenticated session (must be logged in)
// 3. Convert user ID string to MongoDB ObjectId
// 4. Run aggregation pipeline to fetch + sort messages
// 5. Return sorted messages array
//
// WHY AGGREGATION PIPELINE INSTEAD OF A SIMPLE FIND?
// --------------------------------------------------
// Messages are stored as embedded subdocuments inside the User document.
// A simple UserModel.findById() would return messages in insertion order.
// To sort messages by date (newest first), we use an aggregation pipeline:
//
//   $match   → Find the specific user by _id
//   $unwind  → Deconstruct the messages array into individual documents
//   $sort    → Sort individual messages by createdAt (descending = newest first)
//   $group   → Re-assemble the sorted messages back into an array for the user
//
// This approach:
// - Sorts at the database level (faster than sorting in JavaScript)
// - Doesn't modify the original document structure
// - Returns exactly what the frontend needs
//
// AUTHENTICATION:
// - Only the authenticated user can fetch THEIR OWN messages
// - Returns 401 if no valid session exists
// =============================================

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/option';


// This API route retrieves the messages for the authenticated user, sorted by creation date in descending order.
// in this file we will use pipeline to unwind the messages array, sort by createdAt and then group back the messages into an array for the user. This way we can ensure that the messages are returned in the correct order without modifying the original schema or adding additional fields.

export async function GET(request: Request) {
  // Step 1: Connect to MongoDB
  await dbConnect();

  // Step 2: Get the authenticated session
  const session = await getServerSession(authOptions);
  const _user = session?.user as User ;

  // Step 3: Reject if not authenticated
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Step 4: Convert the user ID string to a MongoDB ObjectId
  // Aggregation pipeline requires ObjectId type for $match, not a plain string
  // Convert the user ID to a MongoDB ObjectId for the aggregation pipeline to work correctly
  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    // Step 5: Run aggregation pipeline
    // Use aggregation pipeline to unwind messages, sort by createdAt, and group back the messages
    const user = await UserModel.aggregate([
      // Stage 1: Find the user document that matches this ID
      { $match: { _id: userId } },

      // Stage 2: Deconstruct the messages array
      // Each message becomes its own temporary document
      // e.g., User with 3 messages → 3 separate documents
      { $unwind: '$messages' },

      // Stage 3: Sort the deconstructed messages by createdAt (newest first)
      // -1 = descending order (newest → oldest)
      { $sort: { 'messages.createdAt': -1 } },

      // Stage 4: Re-group the sorted messages back into a single array
      // $push collects all messages into an array, maintaining the sort order
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    // If no user found or user has no messages
    if (!user || user.length === 0) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Step 6: Return the sorted messages array
    // user[0] because aggregate() returns an array of results
    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}