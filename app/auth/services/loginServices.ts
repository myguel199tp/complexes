import { LoginRequest } from "./request/login";
import { LoginResponse } from "./response/login";

/**
 * Apunta al route handler propio, no al backend: es él quien guarda los tokens
 * como cookies httpOnly y los retira del cuerpo de la respuesta.
 */
export async function LoginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
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
