import { ComercioLoginRequest } from "./request/login";
import { ComercioLoginResponse } from "./response/login";

export async function loginComercio(
  data: ComercioLoginRequest,
): Promise<ComercioLoginResponse> {
  // Route handler propio: guarda el token como cookie httpOnly y no lo
  // devuelve en el cuerpo.
  const response = await fetch("/api/comercio/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    let message = "Error en login";

    if (typeof err.message === "string") {
      message = err.message;
    }

    throw new Error(message);
  }

  return response.json();
}
