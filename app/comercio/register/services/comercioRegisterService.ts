import { ComercioRegisterRequest } from "./request/register";
import { ComercioRegisterResponse } from "./response/register";

export async function registerComercio(
  data: ComercioRegisterRequest,
): Promise<ComercioRegisterResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/comercio-auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));

    let message = "Error en el registro";

    if (typeof err.message === "string") {
      message = err.message;
    } else if (Array.isArray(err.message)) {
      message = err.message.join(", ");
    }

    throw new Error(message);
  }

  return response.json();
}
