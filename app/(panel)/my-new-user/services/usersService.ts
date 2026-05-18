import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export async function allUserService(
  conjuntoId: string,
): Promise<EnsembleResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/conjunto`,
    {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  return await response.json();
}
