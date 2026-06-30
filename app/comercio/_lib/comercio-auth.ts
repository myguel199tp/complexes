import { destroyCookie, parseCookies, setCookie } from "nookies";

const COMERCIO_ACCESS_TOKEN = "comercioAccessToken";

export function setComercioToken(accessToken: string) {
  setCookie(null, COMERCIO_ACCESS_TOKEN, accessToken, {
    maxAge: 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    sameSite: "lax",
  });
}

export function getComercioToken(): string | undefined {
  return parseCookies(null)[COMERCIO_ACCESS_TOKEN];
}

export function clearComercioToken() {
  destroyCookie(null, COMERCIO_ACCESS_TOKEN, { path: "/" });
}
