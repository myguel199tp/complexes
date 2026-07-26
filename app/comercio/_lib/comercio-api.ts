import { clearComercioToken } from "./comercio-auth";

// Vía el proxy propio del dominio comercio: el Bearer lo pone el servidor a
// partir de la cookie httpOnly, que el JS ya no puede leer.
const PROXY_BASE = "/api/comercio/proxy/api";

async function parseError(response: Response): Promise<string> {
  const err = await response.json().catch(() => ({}));
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Ocurrió un error inesperado";
}

export async function comercioFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${PROXY_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    credentials: "same-origin",
  });

  if (response.status === 401) {
    await clearComercioToken();
    if (typeof window !== "undefined") {
      window.location.href = "/comercio/login";
    }
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
