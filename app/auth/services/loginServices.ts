import { LoginRequest } from "./request/login";
import { LoginResponse } from "./response/login";

export async function LoginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

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
