import { ComercioLoginRequest } from "./request/login";
import { ComercioLoginResponse } from "./response/login";

export async function loginComercio(
  data: ComercioLoginRequest,
): Promise<ComercioLoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/comercio-auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
