import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeeResponse } from "./response/adminfeesResponse";

/**
 * Adjunta el comprobante a una cuota que ya existe y la deja en revisión.
 *
 * Antes el residente hacía `POST /api/admin-fee`, que CREA una cuota nueva: la
 * cuota original seguía sin pagar y aparecía una segunda fila con el soporte, de
 * modo que la cartera del conjunto quedaba inflada al doble y el residente veía
 * como deuda algo que ya había pagado. Además ese endpoint exige rol employee u
 * owner, así que un arrendatario o un familiar ni siquiera podía subir el
 * soporte.
 */
export async function uploadFeePaymentService(
  feeId: string,
  conjuntoId: string,
  data: FormData,
): Promise<AdminFeeResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/${feeId}/upload-payment`,
    {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
      body: data,
    },
  );

  if (!response.ok) {
    let message = "No se pudo subir el comprobante";

    try {
      const body = await response.json();
      if (Array.isArray(body?.message)) {
        message = body.message[0] ?? message;
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      // el cuerpo no era JSON válido; se mantiene el mensaje por defecto
    }

    throw new Error(message);
  }

  return response.json();
}
