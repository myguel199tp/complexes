import { NextRequest, NextResponse } from "next/server";
import { API_URL, setDeliveryCookie } from "../../_lib/delivery-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Login de repartidor. El backend devuelve el accessToken en el cuerpo; aquí se
 * guarda como cookie httpOnly y se retira de la respuesta, igual que en el
 * dominio comercio.
 */
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));

  const upstream = await fetch(`${API_URL}/api/delivery-auth/login`, {
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

  return setDeliveryCookie(response, accessToken);
}
