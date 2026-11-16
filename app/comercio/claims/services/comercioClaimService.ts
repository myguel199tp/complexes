import { comercioFetch } from "../../_lib/comercio-api";

/**
 * Reclamos de los clientes: lo que llegó dañado, en mal estado, incompleto o
 * equivocado. El comercio tiene 48 horas para reponer, devolver o rechazar
 * con un motivo; si no responde, se cierra sin respuesta.
 */

export type ClaimStatus =
  | "open"
  | "replacement_in_progress"
  | "refund_reported"
  | "resolved"
  | "rejected"
  | "unanswered"
  | "no_agreement"
  | "withdrawn";

export type ClaimCause = "product" | "packaging" | "transport";

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  open: "Por responder",
  replacement_in_progress: "Reposición en curso",
  refund_reported: "Devolución registrada",
  resolved: "Resuelto",
  rejected: "Rechazado",
  unanswered: "Cerrado sin respuesta",
  no_agreement: "Sin acuerdo",
  withdrawn: "Retirado por el cliente",
};

export const CLAIM_STATUS_TONE: Record<ClaimStatus, string> = {
  open: "bg-amber-400/15 text-amber-300",
  replacement_in_progress: "bg-emerald-400/15 text-emerald-300",
  refund_reported: "bg-sky-400/15 text-sky-300",
  resolved: "bg-emerald-400/15 text-emerald-300",
  rejected: "bg-red-400/15 text-red-300",
  unanswered: "bg-red-400/15 text-red-300",
  no_agreement: "bg-red-400/15 text-red-300",
  withdrawn: "bg-white/10 text-slate-300",
};

export const CLAIM_CAUSE_LABELS: Record<ClaimCause, string> = {
  product: "El producto (venía mal del local)",
  packaging: "El empaque",
  transport: "El transporte (se dañó en el camino)",
};

/** Debe coincidir con el backend: lo lee el cliente y es lo que lleva a la SIC. */
export const CLAIM_REJECT_REASON_MIN = 10;

export interface ComercioClaim {
  id: string;
  orderId: string;
  status: ClaimStatus;
  reason: string;
  reasonLabel: string;
  description: string;
  items: { orderItemId: string; name: string; quantity: number; unitPaid: number }[];
  claimedAmount: number;
  photosCount: number;
  requestedResolution: "replacement" | "refund";
  respondBy: string;
  respondedAt?: string | null;
  cause?: ClaimCause | null;
  comercioResponse?: string | null;
  replacementOrderId?: string | null;
  refundAmount?: number | null;
  refundReference?: string | null;
  refundReportedAt?: string | null;
  buyerNote?: string | null;
  closedAt?: string | null;
  history: { at: string; by: "buyer" | "comercio" | "system"; type: string; note?: string | null }[];
  createdAt: string;
  buyerName?: string | null;
  order?: {
    id: string;
    totalAmount: number;
    deliveredAt?: string | null;
    contactPhone?: string | null;
    deliveryAddress?: string | null;
    paymentMethod: string;
  } | null;
  branch?: { id: string; name: string } | null;
  /** Quién lo entregó. Solo lo ve el comercio. */
  delivery?: { id: string; fullName: string } | null;
}

export interface ClaimSummary {
  open: number;
  responseHours: number;
  transportByDelivery: {
    deliveryId: string;
    fullName: string;
    count: number;
    lastAt: string;
  }[];
}

export function getClaims() {
  return comercioFetch<ComercioClaim[]>("/comercio/order-claims");
}

export function getClaimSummary() {
  return comercioFetch<ClaimSummary>("/comercio/order-claims/summary");
}

/** Pasa por el proxy, que pone la sesión: sirve directo en un `<img>`. */
export function claimPhotoUrl(id: string, index: number) {
  return `/api/comercio/proxy/api/comercio/order-claims/${id}/photos/${index}`;
}

export function replaceClaim(id: string, data: { cause: ClaimCause; message?: string }) {
  return comercioFetch<ComercioClaim>(`/comercio/order-claims/${id}/replace`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function refundClaim(
  id: string,
  data: { cause: ClaimCause; amount: number; reference?: string; message?: string },
) {
  return comercioFetch<ComercioClaim>(`/comercio/order-claims/${id}/refund`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function rejectClaim(id: string, reason: string) {
  return comercioFetch<ComercioClaim>(`/comercio/order-claims/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
