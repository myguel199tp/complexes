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

    return await response.json();
  } catch (error) {
    if (error.message === "PLAN_EXPIRED") {
      return [];
    }

    throw error;
  }
}
