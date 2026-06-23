import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ConjuntoSettingsResponse {
  id: string;
  internalHollidayEnabled: boolean;
}

export async function getConjuntoSettings(
  conjuntoId: string,
): Promise<ConjuntoSettingsResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/me`,
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

  return response.json();
}

export async function updateInternalHollidaySetting(
  conjuntoId: string,
  enabled: boolean,
): Promise<ConjuntoSettingsResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/internal-holliday`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ enabled }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "Error al actualizar la configuración");
  }

  return response.json();
}
