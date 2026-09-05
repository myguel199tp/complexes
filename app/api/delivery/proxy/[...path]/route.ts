import { NextRequest, NextResponse } from "next/server";
import {
  API_URL,
  DELIVERY_COOKIE,
  clearDeliveryCookie,
} from "../../../_lib/delivery-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy del dominio repartidor. Separado de /api/proxy y de /api/comercio/proxy:
 * cada uno lee su propia cookie, así que una sesión de comercio no puede
 * alcanzar los endpoints del repartidor ni al revés.
 */
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cookie",
  "authorization",
  "accept-encoding",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

async function handler(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL no está configurada" },
      { status: 500 },
    );
  }

  const accessToken = request.cookies.get(DELIVERY_COOKIE)?.value;

  if (!accessToken) {
    return clearDeliveryCookie(
      NextResponse.json({ message: "SESSION_EXPIRED" }, { status: 401 }),
    );
  }

  const targetUrl = `${API_URL}/${context.params.path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("Authorization", `Bearer ${accessToken}`);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  // No hay refresh token en el dominio repartidor: un 401 es sesión terminada.
  if (upstream.status === 401) {
    return clearDeliveryCookie(
      NextResponse.json({ message: "SESSION_EXPIRED" }, { status: 401 }),
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
