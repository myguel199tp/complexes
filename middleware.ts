import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  listPagePrivate,
  listPagePublic,
} from "./app/_domain/constants/routes";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isPublicRoute = listPagePublic.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    // console.log(`Acceso permitido: Ruta pública (${pathname})`);
    return NextResponse.next();
  }

  const isPrivateRoute = listPagePrivate.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute) {
    // console.log(`Intento de acceso a ruta privada: ${pathname}`);

    if (!token) {
      // console.log("Token no encontrado. Redirigiendo a /auth");
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // console.log("Token recibido. Payload:", payload);

      if (!payload || !payload.exp || Date.now() >= payload.exp * 1000) {
        // console.log("Token expirado. Redirigiendo a /auth");
        throw new Error("Token expirado");
      }
    } catch (error) {
      console.warn("Error procesando el token:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // console.log(`Ruta no categorizada, acceso permitido: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
