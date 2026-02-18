// =============================================
// File: src/lib/dbConnect.ts
// Purpose: Singleton MongoDB connection manager
// =============================================
//
// WHY SINGLETON CONNECTION?
// -------------------------
// In Next.js, every API route and server component can spin up its own
// execution context. Without connection caching, each request would open
// a NEW connection to MongoDB, quickly exhausting the database connection
// pool and causing "too many connections" errors.
//
// HOW IT WORKS:
// 1. We maintain a simple object (`dbConnect`) that stores the connection state.
// 2. Before connecting, we check if `isConnected` is already set.
//    - If yes → skip connecting (reuse existing connection).
//    - If no  → call mongoose.connect() and cache the readyState.
// 3. `readyState` values from Mongoose:
//    - 0 = disconnected
//    - 1 = connected
//    - 2 = connecting
//    - 3 = disconnecting
//
// FLOW:
// API Route called → connectToDB() → Already connected? → Return
//                                  → Not connected? → mongoose.connect() → Cache state → Return
//
// NOTE: In production, consider using Mongoose's built-in connection
// pooling or a global variable on `globalThis` for more robust caching.
// =============================================

import mongoose from "mongoose";
import { ca } from "zod/locales";

// Type definition for tracking connection state
// isConnected stores the Mongoose readyState number (0-3)
type DBConnectOptions = {
    isConnected?: number;
}

// Connection cache object — persists across API route invocations
// within the same server process (but NOT across serverless cold starts)
const dbConnect: DBConnectOptions = {}

/**
 * Connects to MongoDB using Mongoose with singleton pattern.
 *
 * - If already connected, returns immediately (avoids duplicate connections).
 * - If not connected, establishes a new connection and caches the state.
 * - On failure, logs the error and exits the process.
 *
 * @returns {Promise<void>} Resolves when connection is established or already exists.
 */
async function connectToDB(): Promise<void> {
    // CHECK: If we already have an active connection, skip reconnecting
    // This prevents opening multiple connections on repeated API calls
    if (dbConnect.isConnected) {
        console.log("Already connected to database");
        return;
    }
    try {
        // CONNECT: Use the MONGODB_URI from environment variables
        // The empty options object {} uses Mongoose's default connection settings
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {})

        // CACHE: Store the connection readyState (1 = connected)
        // db.connections[0] is the default connection Mongoose creates
        dbConnect.isConnected = db.connections[0].readyState;
        console.log("db.connections[0].readyState", db.connections);
        console.log("db", db);
        console.log("Connected to database");
    }catch (error) {
        // FATAL: If DB connection fails, the app cannot function
        // process.exit(1) terminates the Node.js process with an error code
        console.error("Error connecting to database", error);
        process.exit(1);
    }}

export default connectToDB;