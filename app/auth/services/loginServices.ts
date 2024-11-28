import { LoginRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
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
