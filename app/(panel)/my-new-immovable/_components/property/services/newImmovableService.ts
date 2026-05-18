import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class NewImmovableServices {
  async immovableServices(
    conjuntoId: string,
    data: FormData,
  ): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales/register-immueble`,
      {
        body: data,
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Error al agregar el inmueble");
    }

    return response;
  }
}
