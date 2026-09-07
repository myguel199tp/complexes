import { clearDeliveryToken } from "./delivery-auth";

// Vía el proxy propio del dominio repartidor: el Bearer lo pone el servidor a
// partir de la cookie httpOnly, que el JS ya no puede leer.
const PROXY_BASE = "/api/delivery/proxy/api";

async function parseError(response: Response): Promise<string> {
  const err = await response.json().catch(() => ({}));
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Ocurrió un error inesperado";
}

export async function deliveryFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Con `FormData` la cabecera la pone el navegador, y tiene que ponerla él:
  // `multipart/form-data` lleva un `boundary` que sólo conoce quien serializa.
  // Fijarla a mano dejaba el cuerpo sin separador y el backend no veía ningún
  // archivo.
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(`${PROXY_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    credentials: "same-origin",
  });

  if (response.status === 401) {
    await clearDeliveryToken();
    if (typeof window !== "undefined") {
      window.location.href = "/delivery/login";
    }
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    // El backend corta los pedidos de quien todavía no subió su foto y su
    // documento. Es un 403 con nombre propio: no es "no puedes", es "te falta
    // un paso", así que se manda a hacerlo en vez de enseñar un error.
    if (response.status === 403) {
      const body = await response.clone().json().catch(() => ({}));

      if (body?.code === "ONBOARDING_REQUIRED" && typeof window !== "undefined") {
        window.location.href = "/delivery/onboarding";
        throw new Error("Falta completar tu identificación");
      }
    }

    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
