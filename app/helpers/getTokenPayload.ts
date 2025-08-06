import { parseCookies } from "nookies";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  nit: string;
  rol: string;
  nameUnit: string;
  name: string;
  lastName: string;
  file: string;
  id: string;
  address: string;
  neigborhood: string;
  city: string;
  country: string;
  email: string;
  apartment: string;
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
