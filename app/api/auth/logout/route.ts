import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  API_URL,
  SESSION_COOKIE,
  clearSessionCookies,
} from "../../_lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cierra la sesión en el backend y borra las cookies. Sin la llamada al backend
 * la fila de user_sessions queda activa y el refreshToken podría resucitarla.
 */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;

  if (accessToken && sessionId) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sessionId }),
        cache: "no-store",
      });
    } catch {
      // Si falla la red igual se limpian las cookies locales.
    }
  }

  return clearSessionCookies(NextResponse.json({ success: true }));
}
