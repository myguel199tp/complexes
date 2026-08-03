import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { listPagePrivate } from "./app/_domain/constants/routes";
import { roleRoutes } from "./app/_domain/constants/roleRoutes";

/**
 * Secreto HS256 compartido con el backend (complexph). Server-only: sin este
 * valor no se puede validar ninguna firma, así que el middleware falla cerrado
 * y nadie entra a una ruta privada.
 */
const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

/**
 * Prefijos protegidos por defecto. Todo lo que vive bajo app/(panel) cuelga de
 * "/my-*" o de "/holiday", y "/ensemble" es el selector de conjunto. Al filtrar
 * por prefijo, una pantalla nueva del panel nace protegida aunque nadie se
 * acuerde de añadirla a listPagePrivate.
 */
const PROTECTED_PREFIXES = ["/my-", "/ensemble", "/holiday"] as const;

/**
 * El panel de comercio es un dominio de autenticación aparte: cookie propia,
 * token propio y sin roles. Se protege igual por prefijo, dejando fuera sólo
 * las pantallas de acceso y alta.
 */
const COMERCIO_PREFIX = "/comercio";
const COMERCIO_PUBLIC = ["/comercio/login", "/comercio/register"] as const;
const COMERCIO_COOKIE = "comercioAccessToken";

type SessionPayload = {
  roles: string[];
};

function isProtectedComercioPath(pathname: string): boolean {
  if (
    pathname !== COMERCIO_PREFIX &&
    !pathname.startsWith(COMERCIO_PREFIX + "/")
  ) {
    return false;
  }

  return !COMERCIO_PUBLIC.some((route) => matchesRoute(pathname, route));
}

/**
 * El backend firma los tokens de usuario y los de comercio con el mismo
 * secreto, así que comprobar `type` es lo único que impide que una sesión de
 * residente sirva como sesión de comercio.
 */
async function verifyComercioToken(token: string | undefined): Promise<boolean> {
  if (!token || !secretKey) return false;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    return payload.type === "comercio";
  } catch {
    return false;
  }
}

function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return listPagePrivate.some((route) => matchesRoute(pathname, route));
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  if (!secretKey) return null;

  try {
    // jwtVerify valida firma y "exp"; cualquier fallo lanza y cae al catch.
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    const roles = payload.roles;

    if (!Array.isArray(roles) || !roles.every((r) => typeof r === "string")) {
      return null;
    }

    return { roles };
  } catch {
    return null;
  }
}

/**
 * El backend firma accessToken y refreshToken con el mismo secreto y el mismo
 * payload, sólo cambia el "exp" (2h vs 90d). Eso permite aceptar el refreshToken
 * como prueba de sesión cuando el access ya venció —el cliente lo renovará—
 * sin dejar pasar a cualquiera que se invente la cookie.
 */
async function resolveSession(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken) {
    const session = await verifyToken(accessToken);
    if (session) return session;
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken) {
    const session = await verifyToken(refreshToken);
    if (session) return session;
  }

  return null;
}

/**
 * Redirige a /auth borrando las cookies de sesión. Sin este borrado, unas
 * cookies inválidas persistentes harían que SessionRefresher siguiera intentando
 * refrescar en bucle contra el backend.
 */
function redirectToAuth(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/auth", request.url));

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("sessionId");

  return response;
}

/** Toda ruta mencionada por algún rol; se calcula una vez por instancia. */
const DECLARED_ROUTES = Array.from(
  new Set(Object.values(roleRoutes).flatMap((routes) => [...routes])),
);

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + "/");
}

function isAllowedByRole(pathname: string, roles: string[]): boolean {
  // Ruta del panel que ningún rol declara todavía: basta con sesión válida.
  // Declararla en roleRoutes la somete automáticamente al filtro por rol.
  const isDeclared = DECLARED_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  if (!isDeclared) return true;

  return roles.some((role) => {
    const allowedRoutes = roleRoutes[role as keyof typeof roleRoutes];
    if (!allowedRoutes) return false;

    return allowedRoutes.some((route) => matchesRoute(pathname, route));
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isProtectedComercioPath(pathname)) {
    const hasComercioSession = await verifyComercioToken(
      request.cookies.get(COMERCIO_COOKIE)?.value,
    );

    if (!hasComercioSession) {
      const response = NextResponse.redirect(
        new URL("/comercio/login", request.url),
      );
      response.cookies.delete(COMERCIO_COOKIE);
      return response;
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!secretKey) {
    console.error(
      "JWT_SECRET no está definido: no se pueden validar sesiones. " +
        "Bloqueando el acceso a rutas privadas.",
    );
    return redirectToAuth(request);
  }

  const session = await resolveSession(request);

  if (!session) {
    return redirectToAuth(request);
  }

  if (!isAllowedByRole(pathname, session.roles)) {
    return NextResponse.redirect(new URL("/ensemble", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye assets y los internos de Next para no pagar el coste del
  // middleware en cada imagen o chunk.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|webp|svg|ico|mp4|pdf|txt|xml|woff2?)$).*)",
  ],
};
