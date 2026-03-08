import { EnsembleResponse } from "./response/ensembleResponse";
import { parseCookies } from "nookies";

export async function EnsembleService(): Promise<EnsembleResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation/user`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: EnsembleResponse[] = await response.json();
  return data;
}
