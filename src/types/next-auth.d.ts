import 'next-auth';

// Extend the default Session and User interfaces to include custom properties
// This allows us to access these properties in our application without TypeScript errors
//from here when create whole project become aware of these properties and we can use them in our application without any type errors

declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }
// You can also add other properties to the User interface if needed this user is aleady defined in next auth but we are extending it with our custom properties
  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}