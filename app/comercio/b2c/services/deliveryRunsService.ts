import { comercioFetch } from "../../_lib/comercio-api";

/**
 * Viajes de entrega.
 *
 * Un viaje agrupa hasta diez pedidos del **mismo conjunto** asignados al mismo
 * repartidor, y emite un código de acceso temporal que la portería valida. Es
 * lo que evita que el repartidor tenga que anotarse en la minuta en cada
 * entrega.
 */

export type DeliveryRunStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DeliveryRunStopStatus =
  | "pending"
  | "delivered"
  | "failed"
  | "revoked";

/** Debe coincidir con el tope que valida el backend. */
export const MAX_STOPS_PER_RUN = 10;

export const RUN_STATUS_LABELS: Record<DeliveryRunStatus, string> = {
  pending: "Sin salir",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const RUN_STATUS_TONE: Record<DeliveryRunStatus, string> = {
  pending: "text-amber-300",
  in_progress: "text-blue-300",
  completed: "text-emerald-400",
  cancelled: "text-slate-500",
};

export interface DeliveryRunStop {
  id: string;
  orderId: string;
  deliveryAddress?: string | null;
  status: DeliveryRunStopStatus;
  deliveredAt?: string | null;
}

export interface DeliveryAccessPass {
  id: string;
  code: string;
  validFrom: string;
  validTo: string;
  usedAt?: string | null;
  revoked: boolean;
}

export interface DeliveryRun {
  id: string;
  status: DeliveryRunStatus;
  conjuntoId: string;
  conjunto?: { name?: string } | null;
  delivery?: { fullName?: string } | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  stops: DeliveryRunStop[];
  accessPasses?: DeliveryAccessPass[];
}

/**
 * Pedidos elegibles para un viaje, ya agrupados por conjunto y filtrados por el
 * backend según las reglas del viaje. La pantalla no vuelve a filtrar: si lo
 * hiciera, habría dos versiones de las mismas siete reglas.
 */
export interface RunCandidateGroup {
  conjuntoId: string;
  conjuntoName: string | null;
  conjuntoAddress: string | null;
  orders: {
    id: string;
    totalAmount: number;
    deliveryAddress: string | null;
    itemsCount: number;
    createdAt: string;
  }[];
}

export function getDeliveryRuns(status?: DeliveryRunStatus) {
  const query = status ? `?status=${status}` : "";
  return comercioFetch<DeliveryRun[]>(`/comercio/delivery-runs${query}`);
}

export function getRunCandidates(deliveryId: string) {
  return comercioFetch<RunCandidateGroup[]>(
    `/comercio/delivery-runs/candidates?deliveryId=${deliveryId}`,
  );
}

export function createDeliveryRun(data: {
  deliveryId: string;
  orderIds: string[];
}) {
  return comercioFetch<DeliveryRun>("/comercio/delivery-runs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelDeliveryRun(id: string) {
  return comercioFetch<DeliveryRun>(`/comercio/delivery-runs/${id}/cancel`, {
    method: "PATCH",
  });
}
