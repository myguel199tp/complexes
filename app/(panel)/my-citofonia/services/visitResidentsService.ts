import { backendError } from "@/app/helpers/backendError";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Familiar registrado de quien vive en la unidad. */
export interface HouseholdMember {
  /** Id de la relación usuario–conjunto. */
  id: string;
  name: string | null;
  file: string | null;
}

/** Quien vive en la unidad: propietario residente, arrendatario o residente. */
export interface ResidentHousehold {
  /** Id de la relación usuario–conjunto: único por fila. */
  id: string;
  name: string | null;
  role: "owner" | "tenant" | "resident";
  tower: string | null;
  apartment: string;
  file: string | null;
  family: HouseholdMember[];
}

/**
 * Directorio para escoger a quién va la visita. Solo trae a quienes viven en el
 * conjunto, cada uno con sus familiares: el listado general de relaciones
 * mezclaba porteros, colaboradores y propietarios que no residen ahí.
 */
export async function getVisitResidents(
  conjuntoId: string,
): Promise<ResidentHousehold[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/visit/residents`,
    { headers: { "x-conjunto-id": conjuntoId } },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudieron cargar los residentes");
  }

  return response.json();
}
