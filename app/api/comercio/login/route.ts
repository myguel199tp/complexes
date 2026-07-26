import { NextRequest, NextResponse } from "next/server";
import { API_URL, setComercioCookie } from "../../_lib/comercio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login de comercio. El backend devuelve el accessToken en el cuerpo; aquí se
 * guarda como cookie httpOnly y se retira de la respuesta.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));

  const upstream = await fetch(`${API_URL}/api/comercio-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const { accessToken, ...safe } = data;

  if (!accessToken) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json(
    { ...safe, authenticated: true },
    { status: 200 },
  );

  return setComercioCookie(response, accessToken);
}
