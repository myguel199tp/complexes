/**
 * Mensaje de error del backend listo para mostrar en pantalla.
 *
 * Nest responde `{ statusCode, message, error }`: `message` es el texto útil
 * (string, o array si viene de class-validator) y `error` solo la frase HTTP
 * ("Bad Request"). Antes cada servicio lo resolvía a su manera y muchos
 * lanzaban un texto fijo o el JSON crudo, así que el usuario nunca veía por qué
 * falló la operación.
 */
const DEFAULT_FALLBACK = "No se pudo completar la solicitud. Intenta de nuevo.";

// Lo que Nest manda en un 500 no controlado: no le dice nada al usuario.
const UNINFORMATIVE = new Set(["internal server error"]);

/**
 * Centinelas que lanza `fetchWithAuth`. Varias pantallas los comparan tal
 * cual, por eso no se cambian ahí; solo se traducen al mostrarlos.
 */
const SENTINEL_MESSAGES: Record<string, string> = {
  SESSION_EXPIRED: "Tu sesión expiró. Vuelve a iniciar sesión.",
  PLAN_EXPIRED:
    "El plan del conjunto está vencido. Realiza el pago correspondiente para continuar.",
};

const usable = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim() !== "" &&
  !UNINFORMATIVE.has(value.trim().toLowerCase());

/** Acepta el cuerpo ya parseado o el texto crudo de la respuesta. */
export function backendMessage(
  body: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  let parsed = body;

  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body);
    } catch {
      // Texto plano corto sí se muestra; una página HTML de error (proxy, 502) no.
      const text = body.trim();
      return text && text.length <= 200 && !text.startsWith("<")
        ? text
        : fallback;
    }
  }

  const { message, error } = (parsed ?? {}) as {
    message?: unknown;
    error?: unknown;
  };

  const text = Array.isArray(message)
    ? message.filter(usable).join(", ")
    : message;

  if (usable(text)) return text;
  if (usable(error)) return error;

  return fallback;
}

/** Para usar con `if (!res.ok) throw await backendError(res, "...")`. */
export async function backendError(
  res: Response,
  fallback?: string,
): Promise<Error> {
  const text = await res.text().catch(() => "");
  return new Error(backendMessage(text, fallback));
}

/** Texto que ve el usuario para un mensaje de error (traduce los centinelas). */
export function displayMessage(message: string): string {
  return SENTINEL_MESSAGES[message] ?? message;
}
