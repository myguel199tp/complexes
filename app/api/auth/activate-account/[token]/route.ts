import { NextRequest, NextResponse } from "next/server";
import {
  API_URL,
  setSessionCookies,
  verifyToken,
} from "../../../_lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Activación de contraseña temporal. Deja la sesión iniciada, así que los
 * tokens se guardan como cookies httpOnly igual que en el login.
 */
export async function POST(
  request: NextRequest,
  context: { params: { token: string } },
) {
  const payload = await request.json().catch(() => ({}));

  const upstream = await fetch(
    `${API_URL}/api/auth/activate-account/${context.params.token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const { accessToken, refreshToken, sessionId, ...safe } = data;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const claims = await verifyToken(accessToken);

  const response = NextResponse.json(
    { ...safe, authenticated: true, roles: claims?.roles ?? [] },
    { status: 200 },
  );

  return setSessionCookies(response, { accessToken, refreshToken, sessionId });
}
