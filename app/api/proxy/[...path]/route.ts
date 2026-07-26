import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  API_URL,
  REFRESH_COOKIE,
  SESSION_COOKIE,
  refreshTokens,
  setSessionCookies,
  clearSessionCookies,
} from "../../_lib/session";

// Necesita el runtime de Node para reenviar cuerpos binarios (subida de archivos).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cabeceras que no se deben reenviar tal cual: las de conexión las gestiona
 * undici, y "cookie" se elimina a propósito para que las cookies de sesión del
 * front no viajen al backend (la autorización va sólo por el header Bearer).
 */
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cookie",
  "authorization",
  "accept-encoding",
]);

/**
 * "content-encoding" y "content-length" describen el cuerpo ya decodificado por
 * undici; reenviarlas haría que el navegador intente descomprimir dos veces.
 */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

function buildTargetUrl(request: NextRequest, path: string[]): string {
  const search = request.nextUrl.search;
  return `${API_URL}/${path.join("/")}${search}`;
}

function forwardHeaders(request: NextRequest, accessToken: string): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  headers.set("Authorization", `Bearer ${accessToken}`);

  return headers;
}

function copyResponseHeaders(source: Response): Headers {
  const headers = new Headers();

  source.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

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

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;

  const targetUrl = buildTargetUrl(request, context.params.path);

  // Se almacena en memoria en lugar de reenviar el stream: permite reintentar
  // la misma petición tras refrescar el token sin que el cuerpo quede consumido.
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  const call = (token: string) =>
    fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders(request, token),
      body,
      cache: "no-store",
      redirect: "manual",
    });

  let rotated: Awaited<ReturnType<typeof refreshTokens>> = null;
  let upstream: Response;

  if (accessToken) {
    upstream = await call(accessToken);
  } else {
    // Sin access token no hay nada que intentar: se fuerza el refresco.
    upstream = new Response(null, { status: 401 });
  }

  if (upstream.status === 401) {
    rotated = await refreshTokens(refreshToken, sessionId);

    if (!rotated?.accessToken) {
      const response = NextResponse.json(
        { message: "SESSION_EXPIRED" },
        { status: 401 },
      );
      return clearSessionCookies(response);
    }

    upstream = await call(rotated.accessToken);
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyResponseHeaders(upstream),
  });

  // Si hubo rotación, el navegador se queda con las cookies nuevas y la próxima
  // petición ya no paga el reintento.
  if (rotated) {
    setSessionCookies(response, rotated);
  }

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
