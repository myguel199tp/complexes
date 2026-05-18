import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class RegisterContractServices {
  async subuser(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/register`,
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
