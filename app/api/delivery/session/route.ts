import { NextRequest, NextResponse } from "next/server";
import {
  DELIVERY_COOKIE,
  verifyDeliveryToken,
} from "../../_lib/delivery-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Las páginas no pueden leer la cookie httpOnly para saber si hay sesión, así
 * que la comprobación se hace aquí con la firma validada.
 */
export async function GET(request: NextRequest) {
  const claims = await verifyDeliveryToken(
    request.cookies.get(DELIVERY_COOKIE)?.value,
  );

  return NextResponse.json({ session: claims ?? null }, { status: 200 });
}
