import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeeResponse } from "./response/adminfeesResponse";

export async function getMyFeesThisMonthService(
  conjuntoId: string,
): Promise<AdminFeeResponse[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/my-fees/this-month`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    // Un error del backend se parseaba como si fuera la lista: `data` acababa
    // siendo el objeto de error y la pantalla lo trataba como "sin cuotas".
    if (!response.ok) {
      throw new Error("No pudimos cargar las cuotas de este mes");
    }

    return await response.json();
  } catch (error) {
    if ((error as Error).message === "PLAN_EXPIRED") {
      return [];
    }

    throw error;
  }
}
