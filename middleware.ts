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

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  let payload: JWTPayload;

  try {
    payload = parseJwt(token);

    if (!payload?.exp || !Array.isArray(payload.roles)) {
      throw new Error("Token inválido");
    }

    if (Date.now() >= payload.exp * 1000) {
      throw new Error("Token expirado");
    }
  } catch {
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
