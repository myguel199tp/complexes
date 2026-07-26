import { NextRequest, NextResponse } from "next/server";
import {
  API_URL,
  COMERCIO_COOKIE,
  clearComercioCookie,
} from "../../../_lib/comercio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy del dominio comercio. Deliberadamente separado de /api/proxy: cada uno
 * lee su propia cookie, así que una sesión de residente no puede alcanzar los
 * endpoints de comercio ni al revés.
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

  const accessToken = request.cookies.get(COMERCIO_COOKIE)?.value;

  if (!accessToken) {
    return clearComercioCookie(
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

  // No hay refresh token en el dominio comercio: un 401 es sesión terminada.
  if (upstream.status === 401) {
    return clearComercioCookie(
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
