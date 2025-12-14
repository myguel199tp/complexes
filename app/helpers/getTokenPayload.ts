import { parseCookies } from "nookies";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  nit: string;
  roles: string[];
  name: string;
  lastName: string;
  file: string;
  id: string;
  email: string;
};

export function getTokenPayload(): TokenPayload | null {
  const { accessToken: token } = parseCookies();

  try {
    if (token) {
      const payload = jwtDecode<TokenPayload>(token);
      return payload;
    }
  } catch (err) {
    console.error("Error decodificando JWT:", err);
  }

  return null;
}
