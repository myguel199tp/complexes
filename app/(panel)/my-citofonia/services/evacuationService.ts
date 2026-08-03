import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface EvacuationVisitor {
  id: string;
  name: string;
  document: string;
  visitType?: string;
  plaque?: string | null;
  origin: string;
  entryTime?: string;
  minutesInside: number;
}

export interface EvacuationUnit {
  apartment: string;
  nameUnit: string;
  visitors: EvacuationVisitor[];
}

export interface EvacuationResponse {
  generatedAt: string;
  totalVisitorsInside: number;
  unitsAffected: number;
  units: EvacuationUnit[];
}

/**
 * Quién hay dentro del conjunto que no vive ahí. En una evacuación el censo
 * cubre a los residentes, pero los visitantes eran invisibles: nadie sabía
 * cuánta gente ajena estaba adentro ni en qué apartamento.
 */
export async function evacuationService(
  conjuntoId: string,
): Promise<EvacuationResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/evacuation`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "No se pudo cargar la lista");
  }

  return response.json();
}
