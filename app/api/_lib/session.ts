import "server-only";

import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const SESSION_COOKIE = "sessionId";

/** El backend firma el access con 2h y el refresh con 90d (auth.service.ts). */
const ACCESS_MAX_AGE = 2 * 60 * 60;
const REFRESH_MAX_AGE = 90 * 24 * 60 * 60;

const secret = process.env.JWT_SECRET;
const secretKey = secret ? new TextEncoder().encode(secret) : null;

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type SessionTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
  sessionId?: string | null;
};

/**
 * Claims que el cliente sí puede conocer. Deliberadamente NO incluye el token:
 * el objetivo de httpOnly es que el JS nunca pueda leerlo ni reenviarlo.
 */
export type SessionClaims = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  numberId: string;
  nit: string;
  file: string;
  roles: string[];
  conjuntos: { id: string; name: string }[];
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

export function setSessionCookies(
  response: NextResponse,
  tokens: SessionTokens,
): NextResponse {
  if (tokens.accessToken) {
    response.cookies.set(
      ACCESS_COOKIE,
      tokens.accessToken,
      cookieOptions(ACCESS_MAX_AGE),
    );
  }

  if (tokens.refreshToken) {
    response.cookies.set(
      REFRESH_COOKIE,
      tokens.refreshToken,
      cookieOptions(REFRESH_MAX_AGE),
    );
  }

  if (tokens.sessionId) {
    response.cookies.set(
      SESSION_COOKIE,
      tokens.sessionId,
      cookieOptions(REFRESH_MAX_AGE),
    );
  }

  return response;
}

export function clearSessionCookies(response: NextResponse): NextResponse {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) {
    response.cookies.set(name, "", { ...cookieOptions(0), maxAge: 0 });
  }

  return response;
}

/** Verifica firma y expiración. Devuelve null ante cualquier problema. */
export async function verifyToken(
  token: string | undefined | null,
): Promise<SessionClaims | null> {
  if (!token || !secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    // Aislamiento de dominios: los tokens de comercio se firman con el mismo
    // secreto, así que hay que rechazarlos explícitamente aquí.
    if (payload.type === "comercio") return null;

    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r): r is string => typeof r === "string")
      : [];

    return {
      id: String(payload.id ?? payload.sub ?? ""),
      name: String(payload.name ?? ""),
      lastName: String(payload.lastName ?? ""),
      email: String(payload.email ?? ""),
      numberId: String(payload.numberId ?? ""),
      nit: String(payload.nit ?? ""),
      file: String(payload.file ?? ""),
      roles,
      conjuntos: Array.isArray(payload.conjuntos)
        ? (payload.conjuntos as { id: string; name: string }[])
        : [],
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Pide un access token nuevo al backend. Se ejecuta sólo en el servidor, así que
 * el refreshToken httpOnly nunca sale hacia el navegador.
 */
export async function refreshTokens(
  refreshToken: string | undefined,
  sessionId: string | undefined,
): Promise<SessionTokens | null> {
  if (!refreshToken || !sessionId) return null;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.accessToken) return null;

    return {
      accessToken: data.accessToken as string,
      refreshToken: (data.refreshToken as string) ?? null,
    };
  } catch {
    return null;
  }
}
