import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

export async function allUserVipService(
  conjuntoId: string,
  userId: string,
): Promise<EnsembleResponse[]> {
  const response = await fetch(`/api/conjunto/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}
