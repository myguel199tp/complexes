import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeeResponse } from "./response/adminfeesResponse";

/**
 * Un concepto de cobro del conjunto: lo que el residente puede decir que está
 * pagando cuando la administración todavía no le generó la cuota.
 */
export interface PayableConcept {
  id: string;
  feeType: string;
  amount: number;
  currency: string;
  lastPaymentDate: string | null;
}

export async function getPayableConceptsService(
  conjuntoId: string,
): Promise<PayableConcept[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee-payment/payable-concepts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("No pudimos cargar los conceptos de pago");
    }

    return await response.json();
  } catch (error) {
    if ((error as Error).message === "PLAN_EXPIRED") {
      return [];
    }

    throw error;
  }
}

/**
 * Reporta un pago sobre el que no hay cuota generada.
 *
 * El backend decide si crea el cobro o si lo abona a una cuota existente del
 * mismo concepto: duplicar la fila inflaría la cartera de la unidad al doble.
 */
export async function selfReportPaymentService(
  conjuntoId: string,
  data: FormData,
): Promise<AdminFeeResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/self-report`,
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
