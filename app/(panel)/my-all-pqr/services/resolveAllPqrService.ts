import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AllPqrStatus } from "./response/AllPqrResponse";

export interface ResolveAllBody {
  status: AllPqrStatus;
  resolution: string;
}

export async function ResolveAllPqrService(
  conjuntoId: string,
  id: string,
  data: ResolveAllBody,
): Promise<Response> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/${id}/resolve`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al resolver la PQR: ${errorText}`);
  }

  return response;
}
