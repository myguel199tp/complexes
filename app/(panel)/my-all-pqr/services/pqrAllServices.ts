import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AllPqrResponse } from "./response/AllPqrResponse";

export async function AllPqrService(
  conjuntoId: string,
): Promise<AllPqrResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AllPqrResponse[] = await response.json();
  return data;
}
