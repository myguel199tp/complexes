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
      throw new Error("Error al agregar el negocio");
    }

    return response;
  }
}
