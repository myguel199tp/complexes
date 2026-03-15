import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

export async function allUserService(
  conjuntoId: string,
): Promise<EnsembleResponse[]> {
  const response = await fetch("/api/conjunto", {
    method: "GET",
    headers: {
      "x-conjunto-id": conjuntoId,
    },
  });

  return await response.json();
}
