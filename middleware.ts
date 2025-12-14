import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  listPagePrivate,
  listPagePublic,
} from "./app/_domain/constants/routes";
import { roleRoutes } from "./app/_domain/constants/roleRoutes";
import { JWTPayload } from "./app/_domain/types/jwt-payload";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  // 1. RUTAS PÚBLICAS
  const isPublicRoute = listPagePublic.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) return NextResponse.next();

  // 2. RUTAS PRIVADAS
  const isPrivateRoute = listPagePrivate.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    let payload: JWTPayload;

    try {
      const base64 = token.split(".")[1];
      const jsonPayload = JSON.parse(atob(base64)) as JWTPayload;

      if (!jsonPayload?.exp || !Array.isArray(jsonPayload.roles)) {
        throw new Error("Token inválido");
      }

      if (Date.now() >= jsonPayload.exp * 1000) {
        throw new Error("Token expirado");
      }

      payload = jsonPayload;
    } catch (error) {
      console.warn("Error procesando token:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const userRoles = payload.roles; // ✅ AHORA ES ARRAY

    // 3. VALIDACIÓN DE ACCESO POR ROLES
    const isAllowed = userRoles.some((role) => {
      const allowedRoutes = roleRoutes[role];
      if (!allowedRoutes) return false;

      return allowedRoutes.some((route) => pathname.startsWith(route));
    });

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/my-profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
