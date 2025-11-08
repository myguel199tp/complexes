import { LoginRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function LoginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? "Error en login");
  }

  return response.json();
}
