import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { PqrResponse } from "./response/pqrResponse";
import { backendError } from "@/app/helpers/backendError";

export async function AllPqrInfoService(
  conjuntoId: string,
): Promise<PqrResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/user`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: PqrResponse[] = await response.json();
  return data;
}
