import { NextRequest, NextResponse } from "next/server";
import { API_URL, setSessionCookies, verifyToken } from "../../_lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy del login. El backend devuelve los tokens en el cuerpo; aquí se guardan
 * como cookies httpOnly y se retiran de la respuesta para que el JS del
 * navegador nunca llegue a verlos.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));

  const upstream = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const { accessToken, refreshToken, sessionId, ...safe } = data;

  // Login en dos pasos (OTP o contraseña temporal): todavía no hay sesión.
  if (!accessToken || !refreshToken) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // El cliente ya no puede decodificar el token para saber a dónde redirigir,
  // así que los roles verificados viajan en el cuerpo.
  const claims = await verifyToken(accessToken);

  const response = NextResponse.json(
    { ...safe, authenticated: true, roles: claims?.roles ?? [] },
    { status: 200 },
  );

  return setSessionCookies(response, { accessToken, refreshToken, sessionId });
}
