import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    token: string;
    accessToken: string;
  }

  interface Session {
    user: User;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    accessToken: string;
  }
}
