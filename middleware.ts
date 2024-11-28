import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  listPagePrivate,
  listPagePublic,
} from "./app/_domain/constants/routes";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  // 1. Verificar si la ruta es pública
  const isPublicRoute = listPagePublic.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    console.log(`Acceso permitido: Ruta pública (${pathname})`);
    return NextResponse.next(); // Dejar pasar a las rutas públicas
  }

  // 2. Verificar si la ruta es privada
  const isPrivateRoute = listPagePrivate.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute) {
    console.log(`Intento de acceso a ruta privada: ${pathname}`);

    if (!token) {
      console.log("Token no encontrado. Redirigiendo a /auth");
      return NextResponse.redirect(new URL("/auth", request.url)); // Redirigir a /auth si no hay token
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token recibido. Payload:", payload);

      if (!payload || !payload.exp || Date.now() >= payload.exp * 1000) {
        console.log("Token expirado. Redirigiendo a /auth");
        throw new Error("Token expirado");
      }
    } catch (error) {
      console.error("Error procesando el token:", error);
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // 3. Si la ruta no está en ninguna lista, permitir acceso
  console.log(`Ruta no categorizada, acceso permitido: ${pathname}`);
  return NextResponse.next();
}

// Configuración del middleware
export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"], // Aplicar middleware a todas las rutas
};
