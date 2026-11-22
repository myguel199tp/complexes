/**
 * El corte diario entre un comercio y un repartidor. Lo usan los dos paneles:
 * el del repartidor (`/delivery/settlements`) y el del comercio
 * (`/comercio/delivery-settlements`). Cada uno lo pide con su propia sesión.
 *
 * La plataforma no mueve esta plata: el efectivo que el repartidor cobra en la
 * puerta es del comercio, y el comercio le paga a él por fuera. Esto es el
 * registro que los dos ven igual.
 */

export type SettlementEntryKind = "cash_received" | "payout";
export type SettlementPayoutMethod = "from_cash" | "cash" | "transfer";
export type SettlementEntryStatus = "confirmed" | "pending" | "rejected" | "voided";

/** Lo que pasó en el día (o en un tramo) entre los dos. */
export interface SettlementFigures {
  delivered: number;
  priority: number;
  /** Entregas sin tarifa registrada: lo ganado no las incluye. */
  unpriced: number;
  earned: number;
  /** Efectivo que el repartidor cobró en la puerta. */
  cashCollected: number;
  /** Efectivo que el local registró como recibido. */
  cashReceived: number;
  /** Pagos que el repartidor se quedó del efectivo que traía. */
  paidFromCash: number;
  /** Pagos en efectivo aparte o por transferencia. */
  paidOther: number;
}

export interface SettlementBalance {
  /** Efectivo que el repartidor todavía tiene que entregar al local. */
  cashOwed: number;
  /** Lo que el local todavía le debe al repartidor. */
  payOwed: number;
}

export interface SettlementRowBase {
  linkActive: boolean;
  opening: SettlementBalance;
  dayFigures: SettlementFigures;
  closing: SettlementBalance;
  pendingPayouts: { count: number; amount: number };
}

export interface SettlementEntry {
  id: string;
  kind: SettlementEntryKind;
  amount: number;
  method: SettlementPayoutMethod | null;
  note: string | null;
  status: SettlementEntryStatus;
  day: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export interface SettlementOrderRow {
  orderId: string;
  status: string;
  deliveredAt: string | null;
  paidAt: string | null;
  branchName: string | null;
  deliveryAddress: string | null;
  totalAmount: number;
  paymentMethod: string;
  isPriority: boolean;
  /** Efectivo de este pedido cobrado ese día; 0 si no. */
  cashCollected: number;
  payAmount: number | null;
}

export interface SettlementDetailBase {
  day: string;
  today: string;
  since: string | null;
  opening: SettlementBalance;
  dayFigures: SettlementFigures;
  closing: SettlementBalance;
  pendingPayouts: { count: number; amount: number };
  orders: SettlementOrderRow[];
  entries: SettlementEntry[];
}

export const PAYOUT_METHOD_LABELS: Record<SettlementPayoutMethod, string> = {
  from_cash: "Descontado del efectivo",
  cash: "En efectivo",
  transfer: "Transferencia",
};

export const ENTRY_STATUS_LABELS: Record<SettlementEntryStatus, string> = {
  confirmed: "Cuenta",
  pending: "Por confirmar",
  rejected: "No reconocido",
  voided: "Anulado",
};

/** "2026-11-17" → el día anterior o siguiente, sin líos de zona horaria. */
export function shiftDay(day: string, days: number): string {
  const noon = new Date(`${day}T12:00:00-05:00`);
  return new Date(noon.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

export function dayLabel(day: string, today: string): string {
  if (day === today) return "Hoy";
  if (day === shiftDay(today, -1)) return "Ayer";
  return new Date(`${day}T12:00:00-05:00`).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const settled = (value: number) => Math.abs(value) < 0.01;

/**
 * El saldo de efectivo dicho en palabras, desde el lado de quien lo lee.
 * Negativo pasa cuando se registró más de lo cobrado.
 */
export function cashOwedText(
  value: number,
  viewer: "comercio" | "delivery",
  money: (n: number) => string,
): string {
  if (settled(value)) return "Efectivo al día";
  if (value > 0) {
    return viewer === "delivery"
      ? `Tienes ${money(value)} por entregar`
      : `Te falta recibir ${money(value)}`;
  }
  return viewer === "delivery"
    ? `Entregaste ${money(-value)} de más`
    : `Recibiste ${money(-value)} de más`;
}

export function payOwedText(
  value: number,
  viewer: "comercio" | "delivery",
  money: (n: number) => string,
): string {
  if (settled(value)) return "Pago al día";
  if (value > 0) {
    return viewer === "delivery"
      ? `Te deben ${money(value)}`
      : `Le debes ${money(value)}`;
  }
  return viewer === "delivery"
    ? `Te adelantaron ${money(-value)}`
    : `Le adelantaste ${money(-value)}`;
}
