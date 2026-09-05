import "server-only";

import { jwtVerify } from "jose/jwt/verify";
import { NextResponse } from "next/server";

/**
 * Sesión del repartidor.
 *
 * Cookie propia y separada de la del comercio a propósito: son dos identidades
 * distintas —el repartidor sólo puede ver los pedidos que le asignaron— y
 * compartir cookie haría que iniciar sesión como repartidor en el mismo
 * navegador tumbara la del comercio, o peor, que una sirviera para la otra.
 */
export const DELIVERY_COOKIE = "deliveryAccessToken";

/** El backend firma el token de repartidor con 24h y sin refresh token. */
const DELIVERY_MAX_AGE = 24 * 60 * 60;

const secret = process.env.JWT_SECRET;
const secretKey = secret ? new TextEncoder().encode(secret) : null;

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Claims que el cliente puede conocer. Nunca incluye el token.
 *
 * Sin `comercioId`: desde que una persona puede repartir para varios comercios,
 * el token identifica a quien entra y sus vínculos se consultan aparte.
 */
export type DeliveryClaims = {
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

export function setDeliveryCookie(
  response: NextResponse,
  accessToken: string,
): NextResponse {
  response.cookies.set(
    DELIVERY_COOKIE,
    accessToken,
    cookieOptions(DELIVERY_MAX_AGE),
  );

  return response;
}

export function clearDeliveryCookie(response: NextResponse): NextResponse {
  response.cookies.set(DELIVERY_COOKIE, "", {
    ...cookieOptions(0),
    maxAge: 0,
  });

  return response;
}

/**
 * Verifica firma, expiración y —crítico— que el token pertenezca al dominio
 * "delivery". El backend firma los tokens de usuario, de comercio y de
 * repartidor con el mismo secreto, así que sin comprobar `type` una sesión de
 * comercio valdría como sesión de repartidor y al revés.
 */
export async function verifyDeliveryToken(
  token: string | undefined | null,
): Promise<DeliveryClaims | null> {
  if (!token || !secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (payload.type !== "delivery") return null;

    return {
      id: String(payload.id ?? ""),
      email: String(payload.email ?? ""),
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}
