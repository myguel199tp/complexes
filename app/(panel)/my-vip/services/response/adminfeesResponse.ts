/**
 * Estados de una cuota de administración. Reflejan el enum del backend.
 *
 * `IN_REVIEW` es el que faltaba: el residente ya subió el comprobante y el
 * conjunto todavía no lo verifica. Sin él, una cuota pagada seguía mostrándose
 * como pendiente y contaba como deuda.
 */
export enum FeeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NOTIFIED = "NOTIFIED",
  OVERDUE = "OVERDUE",
  IN_REVIEW = "IN_REVIEW",
  /**
   * La cuota recibió abonos verificados pero todavía queda saldo.
   *
   * Sin este estado no había forma de representar el abono parcial: aprobar
   * marcaba la cuota pagada por el total sin mirar cuánto entró de verdad.
   */
  PARTIAL = "PARTIAL",
}

/** Estados desde los que el residente todavía puede subir comprobante. */
export const PAYABLE_FEE_STATUSES: string[] = [
  FeeStatus.PENDING,
  FeeStatus.OVERDUE,
  FeeStatus.NOTIFIED,
  FeeStatus.REJECTED,
  // Con saldo pendiente se puede seguir abonando.
  FeeStatus.PARTIAL,
];

/**
 * Estados que representan deuda viva de la unidad.
 *
 * Las pantallas de cartera contaban la deuda solo con `PENDING`, pero el cron
 * de medianoche pasa a `OVERDUE` todo lo que se vence: al día siguiente del
 * vencimiento el moroso desaparecía del dashboard. `NOTIFIED` es una cuota
 * avisada pero sin pagar, y `REJECTED` es un comprobante devuelto, así que la
 * deuda sigue ahí en ambos casos.
 *
 * `IN_REVIEW` queda fuera a propósito: el residente ya consignó y lo que falta
 * es que el conjunto verifique, así que no es deuda de él ni recaudo todavía.
 */
export const DEBT_FEE_STATUSES: string[] = [
  FeeStatus.PENDING,
  FeeStatus.OVERDUE,
  FeeStatus.NOTIFIED,
  FeeStatus.REJECTED,
  // Abonada en parte: lo que queda por cobrar es el saldo, no el monto.
  FeeStatus.PARTIAL,
];

/** Saldo pendiente de una cuota: lo que queda después de los abonos. */
export function outstandingOf(fee: {
  amount: number | string;
  paidAmount?: number | string | null;
}): number {
  const total = Number(fee.amount) || 0;
  const paid = Number(fee.paidAmount ?? 0) || 0;

  return Math.max(0, Number((total - paid).toFixed(2)));
}

/** ¿Esta cuota sigue debiéndose? */
export function isDebtFee(status?: string): boolean {
  return DEBT_FEE_STATUSES.includes(status ?? "");
}

/** ¿El residente ya pagó y falta que la administración lo verifique? */
export function isInReviewFee(status?: string): boolean {
  return status === FeeStatus.IN_REVIEW;
}

export const FEE_STATUS_LABEL: Record<string, string> = {
  [FeeStatus.PENDING]: "Pendiente",
  [FeeStatus.APPROVED]: "Pagado",
  [FeeStatus.REJECTED]: "Rechazado",
  [FeeStatus.NOTIFIED]: "Por vencer",
  [FeeStatus.OVERDUE]: "Vencida",
  [FeeStatus.IN_REVIEW]: "En revisión",
  [FeeStatus.PARTIAL]: "Abonada",
};

export function feeStatusLabel(status?: string): string {
  return FEE_STATUS_LABEL[status ?? ""] ?? status ?? "Pendiente";
}

export function feeStatusVariant(
  status?: string,
): "success" | "danger" | "warning" | "primary" {
  switch (status) {
    case FeeStatus.APPROVED:
      return "success";
    case FeeStatus.REJECTED:
    case FeeStatus.OVERDUE:
      return "danger";
    case FeeStatus.IN_REVIEW:
      return "primary";
    // Abonada: hay avance, pero sigue debiendo.
    case FeeStatus.PARTIAL:
      return "warning";
    default:
      return "warning";
  }
}

export function isPayableFee(status?: string): boolean {
  return PAYABLE_FEE_STATUSES.includes(status ?? "");
}

export interface AdminFeeResponse {
  id: string;
  amount: number;
  /** Abonos ya verificados por la administración. */
  paidAmount?: number;
  dueDate: string;
  type: string;
  customName?: string;
  description?: string;
  status: string;
  valuepay?: string | null;
  file?: string | null;
  paidAt?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}
