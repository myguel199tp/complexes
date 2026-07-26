import { LoginComplexRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function loginComplexUser(
  data: LoginComplexRequest
): Promise<LoginResponse> {
  // Route handler propio: guarda los tokens como cookies httpOnly.
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const json: LoginResponse = await response.json();
  return json;
}
