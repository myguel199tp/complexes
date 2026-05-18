import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { EnsembleResponse } from "./response/ensembleResponse";

export async function EnsembleService(): Promise<EnsembleResponse[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/user`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: EnsembleResponse[] = await response.json();
  return data;
}
