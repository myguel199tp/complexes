import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { WarningResponse } from "@/app/(panel)/my-new-user/services/response/warningResponse";

/** Los llamados de atención del residente, de todas sus unidades. */
export async function getMyWarningsService(
  conjuntoId: string,
): Promise<WarningResponse[]> {
  try {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/resident-warnings/my-warnings`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("No pudimos cargar tus llamados de atención");
    }

    return await response.json();
  } catch (error) {
    if ((error as Error).message === "PLAN_EXPIRED") {
      return [];
    }

    throw error;
  }
}
