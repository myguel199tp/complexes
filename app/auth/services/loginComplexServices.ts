import { LoginComplexRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function loginComplexUser(
  data: LoginComplexRequest
): Promise<LoginResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const json: LoginResponse = await response.json();
  return json;
}
