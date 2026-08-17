import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/** Antigüedad de la deuda por tramos, el corte estándar de cartera. */
export interface StatementAging {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90plus: number;
}

export interface StatementFee {
  id: string;
  type: string;
  customName?: string | null;
  description?: string;
  amount: number;
  dueDate: string;
  status: string;
  daysOverdue: number;
  rejectionReason?: string | null;
}

export interface UnitStatement {
  unit: {
    relationId: string;
    tower?: string | null;
    apartment?: string | null;
    resident?: string | null;
    residentLastName?: string | null;
    coefficient?: number | null;
  };
  balance: {
    outstanding: number;
    overdue: number;
    inReview: number;
    paid: number;
    mora: number;
  };
  counts: {
    outstanding: number;
    inReview: number;
    paid: number;
    total: number;
  };
  aging: StatementAging;
  byType: { type: string; count: number; total: number }[];
  oldestDueDate: string | null;
  daysOverdue: number;
  isUpToDate: boolean;
  fees: StatementFee[];
  history: {
    id: string;
    type: string;
    customName?: string | null;
    amount: number;
    dueDate: string;
    paidAt?: string | null;
    approvedAt?: string | null;
  }[];
  /** Pagos verificados con su recibo de caja. */
  payments: StatementPayment[];
}

export interface StatementPayment {
  id: string;
  feeId: string;
  concept?: string | null;
  amount: number;
  paidAt: string;
  receiptNumber?: string | null;
  receiptIssuedAt?: string | null;
  paymentReference?: string | null;
}

/**
 * Bitácora de la cartera: quién hizo qué sobre la deuda de una unidad.
 *
 * La cuota solo guardaba `approvedBy`/`approvedAt` y esos campos se pisan en
 * cada intento, así que no había forma de saber quién aprobó un abono que no
 * cuadraba ni quién le anuló una cuota a un apartamento.
 */
export interface AuditEntry {
  id: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  unit?: string | null;
  amount?: number | null;
  detail?: string | null;
  changes?: Record<string, { from: unknown; to: unknown }> | null;
  createdAt: string;
}

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  FEE_CREATED: "Cuota asignada",
  FEE_UPDATED: "Cuota modificada",
  FEE_DELETED: "Cuota eliminada",
  PAYMENT_REPORTED: "Pago reportado",
  PAYMENT_APPROVED: "Pago verificado",
  PAYMENT_REJECTED: "Pago rechazado",
  COLLECTION_REMINDER: "Recordatorio de cobro",
  CONFIG_SAVED: "Configuración guardada",
  CONFIG_DELETED: "Configuración eliminada",
  FEES_GENERATED: "Cartera generada",
};

export async function getUnitAudit(
  relationId: string,
  conjuntoId: string,
): Promise<AuditEntry[]> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/admin-fee/audit?relationId=${relationId}`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/**
 * Descarga el recibo de caja de un pago verificado.
 *
 * Va por blob y no por un enlace directo porque el endpoint exige el header
 * `x-conjunto-id` y el token: un `<a href>` no los lleva.
 */
export async function downloadReceipt(
  installmentId: string,
  conjuntoId: string,
): Promise<void> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/admin-fee/receipt/${installmentId}/pdf`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `recibo-${installmentId}.pdf`;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Estado de cuenta de una unidad.
 *
 * Antes no existía: para saber cuánto debía un apartamento había que traerse
 * toda la cartera del conjunto y sumarla en el navegador, y la antigüedad de la
 * deuda —el dato con el que se decide si se cobra, se acuerda o se traslada—
 * no se calculaba en ninguna parte.
 */
export async function getUnitStatement(
  relationId: string,
  conjuntoId: string,
): Promise<UnitStatement> {
  const res = await fetchWithAuth(
    `${BASE_URL}/api/admin-fee/unit/${relationId}/statement`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
