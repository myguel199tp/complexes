// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import {
//   listPagePrivate,
//   listPagePublic,
// } from "./app/_domain/constants/routes";
// import { roleRoutes } from "./app/_domain/constants/roleRoutes";
// import { JWTPayload } from "./app/_domain/types/jwt-payload";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("accessToken")?.value;
//   const pathname = request.nextUrl.pathname;

//   // 1. RUTAS PÚBLICAS
//   const isPublicRoute = listPagePublic.some((route) =>
//     pathname.startsWith(route)
//   );
//   if (isPublicRoute) return NextResponse.next();

//   // 2. RUTAS PRIVADAS
//   const isPrivateRoute = listPagePrivate.some((route) =>
//     pathname.startsWith(route)
//   );

//   if (isPrivateRoute) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/auth", request.url));
//     }

//     let payload: JWTPayload;

//     try {
//       const base64 = token.split(".")[1];
//       const jsonPayload = JSON.parse(atob(base64)) as JWTPayload;

//       if (!jsonPayload?.exp || !Array.isArray(jsonPayload.roles)) {
//         throw new Error("Token inválido");
//       }

//       if (Date.now() >= jsonPayload.exp * 1000) {
//         throw new Error("Token expirado");
//       }

//       payload = jsonPayload;
//     } catch (error) {
//       console.warn("Error procesando token:", error);
//       return NextResponse.redirect(new URL("/auth", request.url));
//     }

//     const userRoles = payload.roles; // ✅ AHORA ES ARRAY

//     // 3. VALIDACIÓN DE ACCESO POR ROLES
//     const isAllowed = userRoles.some((role) => {
//       const allowedRoutes = roleRoutes[role];
//       if (!allowedRoutes) return false;

//       return allowedRoutes.some((route) => pathname.startsWith(route));
//     });

//     if (!isAllowed) {
//       return NextResponse.redirect(new URL("/my-profile", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|static|favicon.ico).*)"],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  listPagePrivate,
  listPagePublic,
} from "./app/_domain/constants/routes";
import { roleRoutes } from "./app/_domain/constants/roleRoutes";
import { JWTPayload } from "./app/_domain/types/jwt-payload";

// ✅ Rutas permitidas SIN pago
const ALLOWED_WITHOUT_PAYMENT = ["/my-profile", "/ensemble", "/pay-complexes"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  // 1️⃣ RUTAS PÚBLICAS
  if (listPagePublic.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2️⃣ SI NO ES PRIVADA, PASA
  if (!listPagePrivate.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3️⃣ RUTA PRIVADA SIN TOKEN → AUTH
  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  let payload: JWTPayload & { isActive?: boolean };

  try {
    const base64 = token.split(".")[1];
    payload = JSON.parse(atob(base64));

    if (!payload?.exp || !Array.isArray(payload.roles)) {
      throw new Error("Token inválido");
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new Error("Token expirado");
    }
  } catch (error) {
    console.warn("JWT inválido:", error);
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // ⚠️ IMPORTANTE:
  // si isActive NO existe todavía en el JWT, asumimos false
  const isActive = payload.isActive ?? false;

  // 4️⃣ SIN PAGO → SOLO RUTAS PERMITIDAS
  if (!isActive) {
    const canAccess = ALLOWED_WITHOUT_PAYMENT.some((route) =>
      pathname.startsWith(route)
    );

    if (!canAccess) {
      return NextResponse.redirect(new URL("/my-profile", request.url));
    }

    // ⛔ NO validar roles si no hay pago
    return NextResponse.next();
  }

  // 5️⃣ CON PAGO → VALIDAR POR ROL
  const isAllowedByRole = payload.roles.some((role) => {
    const allowedRoutes = roleRoutes[role];
    if (!allowedRoutes) return false;

    return allowedRoutes.some((route) => pathname.startsWith(route));
  });

  if (!isAllowedByRole) {
    return NextResponse.redirect(new URL("/my-profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
