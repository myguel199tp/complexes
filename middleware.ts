import { NextRequest, NextResponse } from "next/server";
import {
  listPagePrivate,
  listPagePublic,
} from "./app/_domain/constants/routes";
import { JWTPayload } from "./app/_domain/types/jwt-payload";
import { roleRoutes } from "./app/_domain/constants/roleRoutes";

function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  if (
    listPagePublic.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.next();
  }

  if (
    !listPagePrivate.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!token && !refreshToken) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // accessToken ausente/expirado pero refreshToken presente → el cliente lo refresca
  if (!token) {
    return NextResponse.next();
  }

  let payload: JWTPayload;

  try {
    payload = parseJwt(token);

    if (!payload?.exp || !Array.isArray(payload.roles)) {
      throw new Error("Token inválido");
    }

    if (Date.now() >= payload.exp * 1000) {
      // Token expirado: dejar pasar si hay refreshToken, sino redirigir
      if (refreshToken) return NextResponse.next();
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } catch {
    if (refreshToken) return NextResponse.next();
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (pathname.startsWith("/ensemble")) {
    return NextResponse.next();
  }

  const isAllowedByRole = payload.roles.some((role) => {
    const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes];
    if (!allowedRoutes) return false;

    return allowedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );
  });

  if (!isAllowedByRole) {
    return NextResponse.redirect(new URL("/ensemble", request.url));
  }

  return NextResponse.next();
}
