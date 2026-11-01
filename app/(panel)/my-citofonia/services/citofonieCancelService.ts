import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/**
 * Cierra una visita que se quedó esperando —el residente no contestó o el
 * visitante se fue— y suelta su celda de parqueadero. El motivo es obligatorio:
 * queda en la bitácora con el nombre de quien canceló.
 */
export async function cancelVisit(
  conjuntoId: string,
  id: string,
  reason: string,
) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/cancel/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudo cancelar la visita");
  }

  return response.json();
}
