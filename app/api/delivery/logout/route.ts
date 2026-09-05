import { NextResponse } from "next/server";
import { clearDeliveryCookie } from "../../_lib/delivery-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * El backend de repartidor no expone endpoint de logout (el token es de 24h y
 * no hay refresh), así que cerrar sesión es expirar la cookie httpOnly.
 */
export async function POST() {
  return clearDeliveryCookie(NextResponse.json({ success: true }));
}
