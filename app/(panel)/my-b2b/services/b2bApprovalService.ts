import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import type { B2bBillingPeriod, B2bPricingModel } from "./b2bAllianceService";
import type { B2bGroupProgress } from "./b2bDemandService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Decisiones de contratación.
 *
 * El administrador no contrata solo: reúne las propuestas (cotizaciones
 * respondidas o planes del catálogo) y las lleva a decisión. En Platino las
 * vota el consejo en una de sus reuniones; en Básico y Oro las decide el
 * propietario designado como aprobador. Elegir una crea la alianza pendiente
 * que el proveedor confirma.
 */

export type B2bApprovalChannel = "council" | "president";

export type B2bApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "no_decision"
  | "cancelled";

/** Debe coincidir con los topes que valida el backend. */
export const APPROVAL_MAX_PROPOSALS = 6;
export const APPROVAL_REASON_MIN = 10;

export const APPROVAL_STATUS_LABELS: Record<B2bApprovalStatus, string> = {
  pending: "En decisión",
  approved: "Aprobada",
  rejected: "Ninguna aprobada",
  no_decision: "Sin decisión",
  cancelled: "Retirada",
};

export const APPROVAL_CHANNEL_LABELS: Record<B2bApprovalChannel, string> = {
  council: "Consejo de administración",
  president: "Presidente",
};

export interface B2bApprovalItem {
  id: string;
  position: number;
  source: "quote" | "plan" | "renewal";
  quoteId: string | null;
  renewalId: string | null;
  /** En una renovación: lo que paga hoy y cuánto cambia. */
  previousAmount: number | null;
  changePercent: number | null;
  /** Plazo en meses; null en obras de pago único. */
  termMonths: number | null;
  quoteNumber: string | null;
  validUntil: string | null;
  planId: string | null;
  comercioId: string;
  comercioName: string | null;
  /** Soportes obligatorios al día (RUT, cámara, ARL, póliza). */
  verified: boolean;
  rating: { average: number; count: number } | null;
  name: string;
  scope: string | null;
  price: number;
  quantityapt: number | null;
  amount: number;
  currency: string;
  billingPeriod: B2bBillingPeriod;
  pricingModel: B2bPricingModel;
  isRecurring: boolean;
  chosen: boolean;
  /** Compra en grupo: el precio es el techo y baja si aprueban más conjuntos. */
  group?: B2bGroupProgress | null;
  /**
   * Si todavía se puede elegir. Deja de estarlo cuando la cotización vence
   * —por ejemplo, porque cerró la ventana de una compra en grupo— o la
   * renovación ya no está vigente.
   */
  available?: boolean;
  unavailableReason?: string | null;
}

export interface B2bApproval {
  id: string;
  title: string;
  description: string | null;
  channel: B2bApprovalChannel;
  status: B2bApprovalStatus;
  requestedByUserId: string;
  createdAt: string;
  decidedAt: string | null;
  decidedByUserId: string | null;
  decisionNote: string | null;
  chosenItemId: string | null;
  contractId: string | null;
  council: {
    meetingId: string | null;
    meetingTitle: string | null;
    meetingDate: string | null;
    meetingStatus: "pending" | "ongoing" | "finished" | null;
    voteId: string | null;
    tally: { label: string; votes: number }[] | null;
  } | null;
  items: B2bApprovalItem[];
}

export interface B2bApprovalOwner {
  userId: string;
  name: string | null;
  tower: string | null;
  apartment: string | null;
}

/** Quién decide en este conjunto y si hoy se puede llevar algo a decisión. */
export interface B2bApprovalSetup {
  channel: B2bApprovalChannel;
  ready: boolean;
  /** Qué falta para poder llevar a decisión, dicho para la administración. */
  blocker: string | null;
  council: {
    members: number;
    meetings: {
      id: string;
      title: string;
      date: string;
      status: "pending" | "ongoing";
    }[];
  } | null;
  approver: B2bApprovalOwner | null;
}

export interface CreateB2bApprovalInput {
  title: string;
  description?: string;
  quoteIds?: string[];
  planIds?: string[];
  renewalIds?: string[];
  councilMeetingId?: string;
}

export interface MyB2bApprovalStatus {
  isApprover: boolean;
  isCouncilMember: boolean;
  pendingCount: number;
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

// ─── Administración ───

export function getApprovalSetup(conjuntoId: string) {
  return request<B2bApprovalSetup>("/conjunto/b2b/approvals/setup", conjuntoId);
}

export function createApproval(conjuntoId: string, data: CreateB2bApprovalInput) {
  return request<B2bApproval>("/conjunto/b2b/approvals", conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyApprovals(conjuntoId: string) {
  return request<B2bApproval[]>("/conjunto/b2b/approvals", conjuntoId);
}

export function cancelApproval(conjuntoId: string, id: string, reason: string) {
  return request<B2bApproval>(
    `/conjunto/b2b/approvals/${id}/cancel`,
    conjuntoId,
    { method: "PATCH", body: JSON.stringify({ reason }) },
  );
}

// ─── Quien decide (presidente o consejo) ───

export function getMyApprovalStatus(conjuntoId: string) {
  return request<MyB2bApprovalStatus>("/b2b-approvals/me", conjuntoId);
}

export function getApprovalsToDecide(
  conjuntoId: string,
  status?: B2bApprovalStatus,
) {
  const query = status ? `?status=${status}` : "";
  return request<B2bApproval[]>(`/b2b-approvals${query}`, conjuntoId);
}

export function approveProposal(
  conjuntoId: string,
  id: string,
  data: { itemId: string; comment?: string },
) {
  return request<B2bApproval>(`/b2b-approvals/${id}/approve`, conjuntoId, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function rejectApproval(conjuntoId: string, id: string, reason: string) {
  return request<B2bApproval>(`/b2b-approvals/${id}/reject`, conjuntoId, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ─── Formato ───

const PERIOD_LABEL: Record<B2bBillingPeriod, string> = {
  mensual: "mes",
  semestral: "semestre",
  anual: "año",
};

/** "$3.200.000 / mes" o "$18.000.000 · pago único". */
export function proposalPrice(item: B2bApprovalItem) {
  const money = `$${Number(item.amount).toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  })}${item.currency === "COP" ? "" : ` ${item.currency}`}`;

  return item.isRecurring
    ? `${money} / ${PERIOD_LABEL[item.billingPeriod]}`
    : `${money} · pago único`;
}
