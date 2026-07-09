import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class DataPayCoutaServices {
  async PayUserService(conjuntoId: string, data: FormData): Promise<Response> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee`,
      {
        method: "POST",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
        body: data,
      },
    );

    if (!response.ok) {
      let message = "No se pudo registrar el pago";
      try {
        const data = await response.json();
        if (Array.isArray(data?.message)) {
          message = data.message[0] ?? message;
        } else if (data?.message) {
          message = data.message;
        }
      } catch {
        // el cuerpo no era JSON válido; se mantiene el mensaje por defecto
      }
      throw new Error(message);
    }

    return response;
  }
}
