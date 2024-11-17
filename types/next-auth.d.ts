declare module "next-auth" {
  interface User {
    token: string; // Add the token property to the user object
  }

  interface Session {
    user: User;
  }

  interface JWT {
    user: User;
    accessToken: string; // Add the accessToken to the JWT
  }
}
