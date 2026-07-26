import "server-only";

import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export const COMERCIO_COOKIE = "comercioAccessToken";

/** El backend firma el token de comercio con 24h y sin refresh token. */
const COMERCIO_MAX_AGE = 24 * 60 * 60;

const secret = process.env.JWT_SECRET;
const secretKey = secret ? new TextEncoder().encode(secret) : null;

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Claims que el cliente puede conocer. Nunca incluye el token. */
export type ComercioClaims = {
  id: string;
  email: string;
  exp: number;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setComercioCookie(
  response: NextResponse,
  accessToken: string,
): NextResponse {
  response.cookies.set(
    COMERCIO_COOKIE,
    accessToken,
    cookieOptions(COMERCIO_MAX_AGE),
  );

  return response;
}

export function clearComercioCookie(response: NextResponse): NextResponse {
  response.cookies.set(COMERCIO_COOKIE, "", {
    ...cookieOptions(0),
    maxAge: 0,
  });

  return response;
}

/**
 * Verifica firma, expiración y —crítico— que el token pertenezca al dominio
 * "comercio". El backend firma los tokens de usuario y los de comercio con el
 * mismo secreto, así que sin comprobar `type` una sesión de residente valdría
 * como sesión de comercio.
 */
export async function verifyComercioToken(
  token: string | undefined | null,
): Promise<ComercioClaims | null> {
  if (!token || !secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (payload.type !== "comercio") return null;

    return {
      id: String(payload.id ?? ""),
      email: String(payload.email ?? ""),
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}
