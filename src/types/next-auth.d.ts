/**
 * =================================================================================================
 * FILE: next-auth.d.ts
 * =================================================================================================
 *
 * @description TypeScript declaration file for augmenting NextAuth's default types.
 *
 * @layer types
 *
 * @purpose NextAuth provides default types for its `Session`, `User`, and `JWT` objects. However,
 *          our application needs to store additional user-specific data in the session and JWT
 *          (like `_id`, `isVerified`, etc.). This file uses TypeScript's "module augmentation"
 *          to extend the original NextAuth types and add our custom fields.
 *
 * @how_it_works
 * - By declaring the `next-auth` module, we can "reach into" its original type definitions and
 *   add properties to them.
 * - This process is called "declaration merging." TypeScript merges our new interface
 *   declarations with the existing ones from the `next-auth` library.
 * - This ensures that whenever we access `session.user` or the `token` object, TypeScript
 *   is aware of our custom fields, providing type safety and autocompletion.
 *
 * @see /src/app/api/auth/[...nextauth]/options.ts where these augmented types are populated in
 *      the `jwt` and `session` callbacks.
 * =================================================================================================
 */

import 'next-auth';
import { DefaultSession } from 'next-auth';

// =================================================================================================
// MODULE AUGMENTATION: 'next-auth'
// =================================================================================================
declare module 'next-auth' {
  /**
   * @interface Session
   * @description Extends the default `Session` interface from NextAuth.
   *
   * @property user - The `user` object within the session is extended to include our custom fields.
   *           It merges our custom user properties with the `DefaultSession['user']` type, which
   *           typically includes `name`, `email`, and `image`.
   */
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }

  /**
   * @interface User
   * @description Extends the default `User` interface. This is the shape of the user object
   *              returned by the `authorize` function and used in callbacks.
   */
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

// =================================================================================================
// MODULE AUGMENTATION: 'next-auth/jwt'
// =================================================================================================
declare module 'next-auth/jwt' {
  /**
   * @interface JWT
   * @description Extends the default `JWT` interface. This defines the shape of the token
   *              that is created and updated in the `jwt` callback. These properties are then
   *              available in the `session` callback to populate the session object.
   */
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}