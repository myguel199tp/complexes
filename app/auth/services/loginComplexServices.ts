import { LoginComplexRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function loginComplexUser(
  data: LoginComplexRequest
): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-conjunto`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const json: LoginResponse = await response.json();
  return json;
}
