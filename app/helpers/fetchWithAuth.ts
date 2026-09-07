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

/**
 * Los 403 que de verdad significan "el conjunto no tiene plan vigente".
 *
 * El backend usa 403 para muchas cosas distintas: no pertenecer al conjunto, no
 * haber seleccionado uno, no ser dueño de la cuota. Todas caían en el mismo
 * centinela `PLAN_EXPIRED`, así que al residente le aparecía esa palabra suelta
 * en la alerta y los servicios que la atrapan devolvían listas vacías como si
 * estuviera al día. El centinela se conserva —lo consultan decenas de
 * pantallas— pero solo para los mensajes del plan.
 */
const PLAN_MESSAGE_HINTS = [
  "plan actual del conjunto",
  "realiza el pago correspondiente",
];

/** Mensaje de error del backend, si el cuerpo es el JSON de Nest. */
async function readMessage(response: Response): Promise<string | null> {
  try {
    // Sobre el clon: quien atrape el error no lee el cuerpo, pero el original
    // queda intacto por si algún día se necesita.
    const body = await response.clone().json();
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;

    return typeof message === "string" && message.trim() ? message : null;
  } catch {
    return null;
  }
}

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
    const detail = await readMessage(res);

    // Sin mensaje legible se asume lo de siempre, que es como se comportaba.
    if (
      !detail ||
      PLAN_MESSAGE_HINTS.some((hint) => detail.toLowerCase().includes(hint))
    ) {
      throw new Error("PLAN_EXPIRED");
    }

    throw new Error(detail);
  }

  return res;
}
