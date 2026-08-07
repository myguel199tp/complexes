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
}

/** Estados desde los que el residente todavía puede subir comprobante. */
export const PAYABLE_FEE_STATUSES: string[] = [
  FeeStatus.PENDING,
  FeeStatus.OVERDUE,
  FeeStatus.NOTIFIED,
  FeeStatus.REJECTED,
];

export const FEE_STATUS_LABEL: Record<string, string> = {
  [FeeStatus.PENDING]: "Pendiente",
  [FeeStatus.APPROVED]: "Pagado",
  [FeeStatus.REJECTED]: "Rechazado",
  [FeeStatus.NOTIFIED]: "Por vencer",
  [FeeStatus.OVERDUE]: "Vencida",
  [FeeStatus.IN_REVIEW]: "En revisión",
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
