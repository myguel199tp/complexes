import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 *  - `pin`: la puso la administración en el mapa. Exacta.
 *  - `approximate`: salió de la dirección (barrio o calle).
 *  - `pending`: todavía no se ha buscado; tarda alrededor de un minuto.
 *  - `not_found`: la dirección no apareció en el mapa. Solo el pin lo arregla.
 */
export type ConjuntoLocationStatus = "pin" | "approximate" | "pending" | "not_found";

export interface ConjuntoLocation {
  latitude: number | null;
  longitude: number | null;
  source: "pin" | "street" | "neighborhood" | null;
  status: ConjuntoLocationStatus;
  address: string;
  neighborhood: string;
  cityName: string;
  cityCenter: { latitude: number; longitude: number } | null;
}

const url = `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/location`;

async function call(
  conjuntoId: string,
  init: RequestInit = {},
): Promise<ConjuntoLocation> {
  const response = await fetchWithAuth(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "No se pudo actualizar la ubicación");
  }

  return response.json();
}

export function getConjuntoLocation(conjuntoId: string) {
  return call(conjuntoId, { method: "GET" });
}

export function setConjuntoLocation(
  conjuntoId: string,
  point: { latitude: number; longitude: number },
) {
  return call(conjuntoId, { method: "PUT", body: JSON.stringify(point) });
}

export function clearConjuntoLocation(conjuntoId: string) {
  return call(conjuntoId, { method: "DELETE" });
}
