/**
 * Antes leía el accessToken de la cookie y lo ponía en el header Authorization.
 * Ahora las cookies son httpOnly y el JS no puede verlas: la petición se
 * redirige a /api/proxy, un route handler que adjunta el Bearer del lado
 * servidor y renueva la sesión por su cuenta cuando el backend responde 401.
 *
 * La firma se mantiene —los servicios siguen pasando la URL absoluta del
 * backend— para no tocar los ~114 archivos que la usan.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function toProxyUrl(url: string): string {
  if (!API_URL) return url;

  const base = API_URL.replace(/\/+$/, "");

  if (url.startsWith(base)) {
    const path = url.slice(base.length);
    return `/api/proxy${path.startsWith("/") ? path : `/${path}`}`;
  }

  return url;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const res = await fetch(toProxyUrl(url), {
    cache: "no-store",
    ...options,
    // Mismo origen: el navegador adjunta las cookies httpOnly automáticamente.
    credentials: "same-origin",
  });

  // El proxy sólo devuelve 401 cuando ya intentó refrescar y falló.
  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  if (res.status === 403) {
    throw new Error("PLAN_EXPIRED");
  }

  return res;
}
