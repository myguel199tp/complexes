import { comercioFetch } from "../../_lib/comercio-api";

export type DeliveryVehicleType =
  | "motorcycle"
  | "car"
  | "bicycle"
  | "walking"
  | "van";

export interface ComercioDelivery {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  indicative?: string;
  vehicleType?: DeliveryVehicleType;
  licensePlate?: string;
  isActive: boolean;
}

export interface ComercioDeliveryInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  indicative?: string;
  vehicleType?: DeliveryVehicleType;
  licensePlate?: string;
}

export function getDeliveries() {
  return comercioFetch<ComercioDelivery[]>("/comercio/deliveries");
}

export function createDelivery(data: ComercioDeliveryInput) {
  return comercioFetch<ComercioDelivery>("/comercio/deliveries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDelivery(
  id: string,
  data: Partial<Omit<ComercioDeliveryInput, "password">>,
) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateDelivery(id: string) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}/deactivate`, {
    method: "PATCH",
  });
}

export function reactivateDelivery(id: string) {
  return comercioFetch<ComercioDelivery>(`/comercio/deliveries/${id}/reactivate`, {
    method: "PATCH",
  });
}
