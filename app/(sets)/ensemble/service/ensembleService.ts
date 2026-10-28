import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { EnsembleResponse } from "./response/ensembleResponse";
import { backendError } from "@/app/helpers/backendError";

export async function EnsembleService(): Promise<EnsembleResponse[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/user`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: EnsembleResponse[] = await response.json();
  return data;
}
