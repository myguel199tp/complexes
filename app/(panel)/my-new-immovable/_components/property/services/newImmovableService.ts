import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { PublicationPaymentRequired } from "./publicationFeeService";

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
      let message = "Error al agregar el inmueble";
      let body: { message?: unknown; quote?: unknown } | null = null;

      try {
        body = await response.json();
        const detail = Array.isArray(body?.message)
          ? body.message[0]
          : body?.message;
        if (typeof detail === "string" && detail.trim()) message = detail;
      } catch {
        // el cuerpo no era JSON válido; se mantiene el mensaje por defecto
      }

      // 402: ya no es gratis y no se aceptó pagar. Trae la cotización vigente.
      if (response.status === 402 && body?.quote) {
        throw new PublicationPaymentRequired(
          message,
          body.quote as PublicationPaymentRequired["quote"],
        );
      }

      throw new Error(message);
    }

    return response;
  }
}
