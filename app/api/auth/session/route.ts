import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  verifyToken,
} from "../../_lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Identidad del usuario para el cliente. Sustituye al antiguo getTokenPayload,
 * que decodificaba la cookie desde el navegador. Devuelve claims verificados,
 * nunca el token.
 */
export async function GET(request: NextRequest) {
  const claims =
    (await verifyToken(request.cookies.get(ACCESS_COOKIE)?.value)) ??
    (await verifyToken(request.cookies.get(REFRESH_COOKIE)?.value));

  if (!claims) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  return NextResponse.json({ session: claims }, { status: 200 });
}
