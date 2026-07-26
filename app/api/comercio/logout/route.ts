import { NextResponse } from "next/server";
import { clearComercioCookie } from "../../_lib/comercio-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * El backend de comercio no expone endpoint de logout (el token es de 24h y no
 * hay refresh), así que cerrar sesión es expirar la cookie httpOnly.
 */
export async function POST() {
  return clearComercioCookie(NextResponse.json({ success: true }));
}
