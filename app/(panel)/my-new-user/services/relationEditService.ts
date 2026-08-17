import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/user-conjunto-relation`;

/**
 * El correo NO se incluye a propósito: es la credencial de acceso del
 * residente y el backend tampoco lo acepta desde estos endpoints.
 */
export interface UpdateRelationUserInfoDto {
  name?: string;
  lastName?: string;
  numberId?: string;
  indicative?: string;
  phone?: string;
  council?: boolean;
}

export interface VehiclePayload {
  type: string;
  parkingType: string;
  /**
   * Celda del inventario. En el formulario, cadena vacía significa "sin celda":
   * al crear se omite la propiedad y al editar se manda `null` para liberar la
   * celda actual. El backend la valida con `@IsOptional() @IsUUID()`, y
   * `@IsOptional` solo salta undefined/null, así que un `""` daría 400.
   */
  parkingSpotId?: string;
  plaque: string;
}

/** Al crear: sin celda elegida, la propiedad no viaja. */
function withoutEmptySpot({ parkingSpotId, ...vehicle }: VehiclePayload) {
  return parkingSpotId ? { ...vehicle, parkingSpotId } : vehicle;
}

/** Al editar: `""` es una orden explícita de liberar la celda → `null`. */
function normalizeSpotForUpdate(dto: Partial<VehiclePayload>) {
  if (!("parkingSpotId" in dto)) return dto;
  return { ...dto, parkingSpotId: dto.parkingSpotId || null };
}

async function request(url: string, conjuntoId: string, init: RequestInit) {
  const response = await fetchWithAuth(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? "No se pudo guardar el cambio");
  }

  return response.json().catch(() => ({}));
}

export function updateRelationUserInfoService(
  relationId: string,
  conjuntoId: string,
  dto: UpdateRelationUserInfoDto,
) {
  return request(`${BASE}/${relationId}/user-info`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function addRelationVehicleService(
  relationId: string,
  conjuntoId: string,
  dto: VehiclePayload,
) {
  return request(`${BASE}/${relationId}/vehicles`, conjuntoId, {
    method: "POST",
    body: JSON.stringify(withoutEmptySpot(dto)),
  });
}

export function updateRelationVehicleService(
  relationId: string,
  conjuntoId: string,
  vehicleId: string,
  dto: Partial<VehiclePayload>,
) {
  return request(`${BASE}/${relationId}/vehicles/${vehicleId}`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify(normalizeSpotForUpdate(dto)),
  });
}

export function removeRelationVehicleService(
  relationId: string,
  conjuntoId: string,
  vehicleId: string,
) {
  return request(`${BASE}/${relationId}/vehicles/${vehicleId}`, conjuntoId, {
    method: "DELETE",
  });
}
