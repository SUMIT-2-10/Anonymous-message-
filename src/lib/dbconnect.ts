/**
 * =================================================================================================
 * FILE: dbConnect.ts
 * =================================================================================================
 *
 * @description A singleton-style database connection manager for Mongoose.
 *
 * @layer lib
 *
 * @purpose In a serverless environment like Next.js, functions can be instantiated and destroyed
 *          with each request. Creating a new database connection every time is inefficient and
 *          can exhaust the database's connection limit. This module implements a cached
 *          connection strategy to ensure that only one connection is active per server instance.
 *
 * @how_it_works
 * 1. A global `connection` object is used to cache the connection status.
 * 2. The `dbConnect` function is called at the beginning of any API route that needs database
 *    access.
 * 3. It first checks if `connection.isConnected` has a truthy value (a Mongoose readyState).
 *    - If YES, it reuses the existing connection and returns immediately.
 *    - If NO, it establishes a new connection using the `MONGODB_URI` environment variable.
 * 4. Once connected, it stores the connection's `readyState` in `connection.isConnected`.
 * 5. If the connection fails, it logs a critical error and terminates the process, as the
 *    application cannot function without a database.
 *
 * @see Mongoose readyState values:
 *  - 0: disconnected
 *  - 1: connected
 *  - 2: connecting
 *  - 3: disconnecting
 * =================================================================================================
 */

// =================================================================================================
// IMPORTS
// =================================================================================================
import mongoose from 'mongoose';

// =================================================================================================
// CONNECTION CACHE
// =================================================================================================
/**
 * @type {{ isConnected?: number }}
 * @description A simple object to cache the database connection state across function invocations.
 *              `isConnected` will hold the Mongoose `readyState` number.
 */
type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

// =================================================================================================
// FUNCTION
// =================================================================================================
/**
 * @function dbConnect
 * @description Establishes and caches a connection to the MongoDB database.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is established or if it
 *                          already exists.
 *
 * @logic
 * 1. **Check for Existing Connection:** The function first checks `connection.isConnected`. If it's
 *    already set, it logs a message and exits, preventing the creation of a new connection.
 * 2. **Establish New Connection:** If no connection is cached, it proceeds to connect using
 *    `mongoose.connect()`.
 *    - It retrieves the database connection string from `process.env.MONGODB_URI`.
 *    - An empty string fallback is provided to prevent `mongoose.connect` from throwing an
 *      error if the environment variable is missing, although the connection will still fail.
 * 3. **Cache the Connection State:** Upon a successful connection, it captures the `readyState`
 *    from `db.connections[0]` and stores it in `connection.isConnected`. A `readyState` of 1
 *    indicates a successful connection.
 * 4. **Handle Connection Errors:** If `mongoose.connect()` throws an error, it's caught in the
 *    `catch` block. The error is logged, and `process.exit(1)` is called to immediately
 *    terminate the application. This is a fail-fast approach, as the application is inoperable
 *    without a database link.
 */
async function dbConnect(): Promise<void> {
  // If a connection is already cached, reuse it
  if (connection.isConnected) {
    console.log('Already connected to the database.');
    return;
  }

  try {
    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

    // Cache the connection state (readyState)
    connection.isConnected = db.connections[0].readyState;

    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);

    // Exit the process with a failure code
    process.exit(1);
  }
}

export default dbConnect;