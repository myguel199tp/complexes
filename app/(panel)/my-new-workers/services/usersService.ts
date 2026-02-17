import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

export async function allUserService(
  conjuntoId: string,
): Promise<EnsembleResponse[]> {
  const response = await fetch("/api/conjunto", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include", // importante
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
