import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AdminFeeResponse } from "./response/adminfeesResponse";

export interface MyFeesResponse {
  totalFees: number;
  paidCount: number;
  pendingCount: number;
  paid: AdminFeeResponse[];
  pending: AdminFeeResponse[];
}

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

    return await response.json();
  } catch (error) {
    if (error.message === "PLAN_EXPIRED") {
      return {
        totalFees: 0,
        paidCount: 0,
        pendingCount: 0,
        paid: [],
        pending: [],
      };
    }

    throw error;
  }
}
