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

/**
 * Tipo con el que el backend factura una multa.
 *
 * Una multa no es una tabla aparte: `resident-fine` crea un `AdminFee` de este
 * tipo para que la sanción entre a la cartera y se pueda pagar como cualquier
 * cuota. El costo es que todo lo que cuente cuotas la cuenta también, y la
 * generación anual de 12 meses aparecía como 13 cobros sin explicación.
 *
 * El literal estaba copiado en varias pantallas; vive aquí para que separarlas
 * sea una sola decisión.
 */
export const FINE_FEE_TYPE = "Multas o sanciones económicas";

/** ¿Este cobro es una multa y no una cuota? */
export function isFineFee(type?: string | null): boolean {
  return type?.trim() === FINE_FEE_TYPE;
}

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

/**
 * ¿La fecha de vencimiento ya pasó?
 *
 * Se compara a medianoche para que la cuota que vence hoy no cuente como
 * vencida sino hasta mañana, que es como lo lee el residente.
 */
export function isPastDue(dueDate?: string | Date | null): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

/**
 * ¿Esta cuota está en mora?
 *
 * Deber y estar en mora no son lo mismo: al generar la cartera del año quedan
 * doce cuotas `PENDING` de una vez, y contarlas todas como mora dejaba a todo
 * el conjunto como moroso el mismo día en que se generaron, por cuotas que
 * todavía no se podían pagar.
 *
 * Mora es deuda viva **cuya fecha ya pasó**. Se acepta `OVERDUE` directo
 * porque es lo que marca el cron del backend, y la fecha cubre el rato entre
 * el vencimiento y la siguiente corrida del cron.
 */
export function isOverdueFee(fee: {
  status?: string;
  dueDate?: string | Date | null;
}): boolean {
  if (!isDebtFee(fee.status)) return false;
  if (fee.status === FeeStatus.OVERDUE) return true;

  return isPastDue(fee.dueDate);
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
