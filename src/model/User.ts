/**
 * =================================================================================================
 * FILE: User.ts
 * =================================================================================================
 *
 * @description Mongoose schemas and models for the User and embedded Message documents.
 *
 * @layer model
 *
 * @purpose This file defines the data structure for users and the messages they receive. It is
 *          the blueprint for how user-related data is stored in the MongoDB database.
 *
 * @architectural_choice Embedded Documents for Messages
 * - **What it is:** Instead of creating a separate `Message` collection, messages are stored as
 *   an array of subdocuments directly within the `User` document that owns them.
 * - **Why this approach?**
 *   1. **Data Locality:** Messages are always retrieved with their parent user. Embedding them
 *      avoids the need for a separate database query (a `$lookup` or `populate`), making reads
 *      faster and simpler.
 *   2. **Strong Ownership:** A message belongs exclusively to one user. This one-to-many
 *      relationship, where the "many" side (messages) is accessed through the "one" side (user),
 *      is a classic use case for embedding.
 *   3. **Atomic Operations:** Updates to a user and their messages can be performed in a single,
 *      atomic operation.
 * - **Considerations:** This pattern is ideal when the embedded array is not expected to grow
 *   infinitely. MongoDB has a document size limit of 16MB, which is more than enough for this
 *   application's use case.
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import mongoose, { Schema, Document } from 'mongoose';

// =================================================================================================
// MESSAGE SCHEMA (SUBDOCUMENT)
// =================================================================================================
/**
 * @interface Message
 * @description Represents a single anonymous message. It extends `mongoose.Document` to include
 *              Mongoose-specific properties like `_id`.
 *
 * @property {string} content - The text content of the message.
 * @property {Date} createdAt - The timestamp when the message was created.
 */
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

/**
 * @const MessageSchema
 * @description The Mongoose schema for the `Message` subdocument.
 */
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: [true, 'Message content is required.'],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// =================================================================================================
// USER SCHEMA (TOP-LEVEL DOCUMENT)
// =================================================================================================
/**
 * @interface User
 * @description Represents a user of the application.
 *
 * @property {string} username - The user's unique public identifier.
 * @property {string} email - The user's unique email address, used for login and notifications.
 * @property {string} password - The user's hashed password.
 * @property {string} verifycode - A 6-digit code sent for email verification.
 * @property {Date} verifycodeExpire - The expiration date for the `verifycode`.
 * @property {boolean} isVerified - Flag indicating if the user has verified their email.
 * @property {boolean} isAcceptingMessages - Flag allowing the user to enable/disable receiving messages.
 * @property {Message[]} messages - An array of embedded message subdocuments.
 */
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifycode: string;
  verifycodeExpire: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

/**
 * @const UserSchema
 * @description The Mongoose schema for the `User` document.
 */
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
  },
  verifycode: {
    type: String,
    required: [true, 'Verification code is required.'],
  },
  verifycodeExpire: {
    type: Date,
    required: [true, 'Verification code expiry date is required.'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: false,
  },
  messages: [MessageSchema],
});

// =================================================================================================
// MODEL EXPORT
// =================================================================================================
/**
 * @const UserModel
 * @description The Mongoose model for the `User` collection.
 *
 * @logic
 * - **Problem:** In a Next.js development environment with hot-reloading, the code that defines
 *   a Mongoose model can be executed multiple times. Attempting to redefine an existing model
 *   (`mongoose.model("User", UserSchema)`) throws a `OverwriteModelError`.
 * - **Solution:** This code checks if the `User` model has already been compiled and registered
 *   in `mongoose.models`.
 *   - If `mongoose.models.User` exists, it reuses the existing model.
 *   - If it does not exist, it creates a new model using `mongoose.model<User>('User', UserSchema)`.
 * This ensures that the model is only created once per server instance.
 */
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;