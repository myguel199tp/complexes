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
  assignmentNumber?: string;
  plaque: string;
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
    body: JSON.stringify(dto),
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
    body: JSON.stringify(dto),
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
