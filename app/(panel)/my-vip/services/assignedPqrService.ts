import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AllPqrResponse } from "../../my-all-pqr/services/response/AllPqrResponse";

/**
 * Peticiones que la administración derivó al colaborador que está consultando.
 *
 * El endpoint filtra por el usuario del token, así que no recibe ningún id:
 * cada colaborador sólo ve lo suyo.
 */
export async function AssignedPqrService(
  conjuntoId: string,
): Promise<AllPqrResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/assigned`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message ?? "Error al obtener las peticiones asignadas");
  }

  return json;
}
