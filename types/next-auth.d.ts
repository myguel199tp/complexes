import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    token: string; // El token se incluye en el objeto usuario
    accessToken: string;
  }

  interface Session {
    user: User; // El usuario en la sesión
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User; // El usuario dentro del token JWT
    accessToken: string; // El token de acceso
  }
}
