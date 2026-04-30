import { parseCookies } from "nookies";

export class RegisterSubuserServices {
  async subuser(conjuntoId: string, data: FormData): Promise<Response> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-subuser`,
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
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
