import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  clearSessionCookies,
  refreshTokens,
  setSessionCookies,
  verifyToken,
} from "../../_lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Renueva la sesión usando el refreshToken httpOnly. El cliente sólo recibe la
 * nueva fecha de expiración, que es lo único que necesita para reprogramar el
 * siguiente refresco.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;

  const rotated = await refreshTokens(refreshToken, sessionId);

  if (!rotated?.accessToken) {
    const response = NextResponse.json(
      { message: "SESSION_EXPIRED" },
      { status: 401 },
    );
    return clearSessionCookies(response);
  }

  const claims = await verifyToken(rotated.accessToken);

  const response = NextResponse.json({ exp: claims?.exp ?? null });

  return setSessionCookies(response, rotated);
}
