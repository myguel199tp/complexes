import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { MultaResponse } from "@/app/(panel)/my-new-user/services/response/multaResponse";

export async function getMyFinesService(
  conjuntoId: string,
): Promise<MultaResponse[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resident-fines/my-fines`,
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
    if ((error as Error).message === "PLAN_EXPIRED") {
      return [];
    }

    throw error;
  }
}
