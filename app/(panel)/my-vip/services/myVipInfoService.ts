import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function allUserVipService(
  conjuntoId: string,
  userId: string,
): Promise<EnsembleResponse[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/all/${userId}`,
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
