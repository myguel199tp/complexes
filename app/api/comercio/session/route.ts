import { NextRequest, NextResponse } from "next/server";
import {
  COMERCIO_COOKIE,
  verifyComercioToken,
} from "../../_lib/comercio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sustituye a getComercioToken(): las páginas ya no pueden leer la cookie para
 * saber si hay sesión, así que la comprobación se hace aquí con firma validada.
 */
export async function GET(request: NextRequest) {
  const claims = await verifyComercioToken(
    request.cookies.get(COMERCIO_COOKIE)?.value,
  );

  return NextResponse.json({ session: claims ?? null }, { status: 200 });
}
