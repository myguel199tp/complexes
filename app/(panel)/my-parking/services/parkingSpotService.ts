import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ParkingSpotType =
  | "resident"
  | "visitor"
  | "motorcycle"
  | "disabled";

export const PARKING_SPOT_TYPES: {
  value: ParkingSpotType;
  label: string;
}[] = [
  { value: "resident", label: "Residente" },
  { value: "visitor", label: "Visitante" },
  { value: "motorcycle", label: "Moto" },
  { value: "disabled", label: "Movilidad reducida" },
];

export interface ParkingSpot {
  id: string;
  code: string;
  zone?: string;
  type: ParkingSpotType;
  /** La celda se asigna al vehículo, no a la unidad: un apto puede tener varios. */
  vehicleId?: string | null;
  vehicle?: {
    id: string;
    plaque: string;
    type: "carro" | "moto";
    relation?: { apartment?: string; tower?: string } | null;
  } | null;
  assignedAt?: string | null;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

/** Vehículo del conjunto con la celda que ocupa, si tiene una. */
export interface ParkingVehicle {
  id: string;
  plaque: string;
  type: "carro" | "moto";
  parkingType: "publico" | "privado";
  apartment: string | null;
  tower: string | null;
  spot: { id: string; code: string } | null;
}

export interface ParkingAvailability {
  total: number;
  active: number;
  byType: Record<ParkingSpotType, { total: number; assigned: number }>;
  visitors: {
    capacity: number;
    occupied: number;
    available: number;
    overCapacity: boolean;
    /** Vehículos de visita que entraron sin celda por falta de cupo. */
    overcapacityVehicles: number;
  };
}

/** Celda de visitantes ocupada, con la visita que la retiene. */
export interface VisitorSpotOccupancy {
  spotId: string;
  code: string;
  zone: string | null;
  visitId: string;
  namevisit: string;
  apartment: string;
  plaque: string | null;
  status: string;
  entryTime: string | null;
  createdAt: string;
}

export interface CreateParkingSpotInput {
  code: string;
  zone?: string;
  type?: ParkingSpotType;
  vehicleId?: string;
  isActive?: boolean;
  notes?: string;
}

async function request<T>(
  path: string,
  conjuntoId: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetchWithAuth(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(", ")
          : "Ocurrió un error inesperado";
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getParkingSpots(
  conjuntoId: string,
  filters: { type?: ParkingSpotType; assigned?: boolean } = {},
) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (typeof filters.assigned === "boolean") {
    params.set("assigned", String(filters.assigned));
  }

  const query = params.toString();
  return request<ParkingSpot[]>(
    `/parking-spots${query ? `?${query}` : ""}`,
    conjuntoId,
  );
}

export function getParkingAvailability(conjuntoId: string) {
  return request<ParkingAvailability>("/parking-spots/availability", conjuntoId);
}

/**
 * Celdas de visitantes libres ahora mismo. Alimenta el selector de portería: la
 * disponibilidad cambia con cada registro y cada salida, así que la lista se
 * pide al momento en vez de filtrar el inventario en el cliente.
 */
export function getFreeVisitorSpots(conjuntoId: string) {
  return request<ParkingSpot[]>("/parking-spots/visitor-free", conjuntoId);
}

export function getVisitorOccupancy(conjuntoId: string) {
  return request<VisitorSpotOccupancy[]>(
    "/parking-spots/visitor-occupancy",
    conjuntoId,
  );
}

export function createParkingSpot(
  conjuntoId: string,
  data: CreateParkingSpotInput,
) {
  return request<ParkingSpot>("/parking-spots", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getParkingVehicles(conjuntoId: string) {
  return request<ParkingVehicle[]>("/parking-spots/vehicles", conjuntoId);
}

export function assignParkingSpot(
  conjuntoId: string,
  id: string,
  vehicleId: string,
) {
  return request<ParkingSpot>(`/parking-spots/${id}/assign`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ vehicleId }),
  });
}

export function releaseParkingSpot(conjuntoId: string, id: string) {
  return request<ParkingSpot>(`/parking-spots/${id}/release`, conjuntoId, {
    method: "PATCH",
  });
}

export function setParkingSpotActive(
  conjuntoId: string,
  id: string,
  isActive: boolean,
) {
  return request<ParkingSpot>(`/parking-spots/${id}`, conjuntoId, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
