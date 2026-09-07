import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeeResponse } from "./response/adminfeesResponse";

export interface MyFeesResponse {
  totalFees: number;
  paidCount: number;
  pendingCount: number;
  paid: AdminFeeResponse[];
  pending: AdminFeeResponse[];
}

const EMPTY: MyFeesResponse = {
  totalFees: 0,
  paidCount: 0,
  pendingCount: 0,
  paid: [],
  pending: [],
};

export async function getMyFeesService(
  conjuntoId: string,
): Promise<MyFeesResponse> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/my-fees`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    /**
     * Sin esta comprobación, un 400 o un 500 se parseaban igual y `pending`
     * quedaba `undefined`: la pantalla mostraba "No tienes cuotas por pagar" y
     * el residente creía estar al día sobre una deuda que el backend nunca
     * llegó a devolver.
     */
    if (!response.ok) {
      let message = "No pudimos cargar tus cuotas";

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

    return await response.json();
  } catch (error) {
    if ((error as Error).message === "PLAN_EXPIRED") {
      return EMPTY;
    }

    throw error;
  }
}
