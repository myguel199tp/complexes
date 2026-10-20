import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class RegisterSubuserServices {
  async subuser(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-subuser`,
      {
        method: "POST",
        body: data,
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      // El backend explica por qué (ya tiene arrendatario, celda ocupada…);
      // los errores de validación llegan como lista y ahí queda el genérico.
      const error = await response.json().catch(() => ({}));
      const message = Array.isArray(error?.message)
        ? error.message[0]
        : error?.message;

      throw new Error(
        typeof message === "string" && message.trim()
          ? message
          : "No se pudo agregar el arrendatario",
      );
    }

    return response;
  }
}
