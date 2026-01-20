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

//   // 1️⃣ RUTAS PÚBLICAS
//   if (listPagePublic.some((route) => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   // 2️⃣ SI NO ES PRIVADA, PASA
//   if (!listPagePrivate.some((route) => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   // 3️⃣ RUTA PRIVADA SIN TOKEN → AUTH
//   if (!token) {
//     return NextResponse.redirect(new URL("/auth", request.url));
//   }

//   let payload: JWTPayload;

//   try {
//     const base64 = token.split(".")[1];
//     payload = JSON.parse(atob(base64));

//     if (!payload?.exp || !Array.isArray(payload.roles)) {
//       throw new Error("Token inválido");
//     }

//     if (Date.now() >= payload.exp * 1000) {
//       throw new Error("Token expirado");
//     }
//   } catch (error) {
//     console.warn("JWT inválido:", error);
//     return NextResponse.redirect(new URL("/auth", request.url));
//   }

//   // 4️⃣ VALIDACIÓN POR ROL (ÚNICA AUTORIZACIÓN AQUÍ)
//   const isAllowedByRole = payload.roles.some((role) => {
//     const allowedRoutes = roleRoutes[role];
//     if (!allowedRoutes) return false;

//     return allowedRoutes.some((route) => pathname.startsWith(route));
//   });

//   if (!isAllowedByRole) {
//     return NextResponse.redirect(new URL("/my-profile", request.url));
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

  // 3️⃣ PRIVADA SIN TOKEN → AUTH
  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  let payload: JWTPayload;

  try {
    const base64 = token.split(".")[1];
    payload = JSON.parse(atob(base64));

    if (!payload?.exp || !Array.isArray(payload.roles)) {
      throw new Error("Token inválido");
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new Error("Token expirado");
    }
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 4️⃣ ACCESO UNIVERSAL A /ensemble
  if (pathname.startsWith("/ensemble")) {
    return NextResponse.next();
  }

  // 5️⃣ VALIDACIÓN POR ROL
  const isAllowedByRole = payload.roles.some((role) => {
    const allowedRoutes = roleRoutes[role];
    if (!allowedRoutes) return false;

    return allowedRoutes.some((route) => pathname.startsWith(route));
  });

  // 6️⃣ FALLBACK SEGURO
  if (!isAllowedByRole) {
    return NextResponse.redirect(new URL("/ensemble", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
