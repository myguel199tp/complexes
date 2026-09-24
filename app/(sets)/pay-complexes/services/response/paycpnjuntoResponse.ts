export interface payConjuntoResposne {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  cellphone: string;
  plan: string;
  prices: number;
  currency: string;
  isActive: boolean;
  lastPaymentDate: Date;
  nextPaymentDate: Date;
  billingPeriod: "mensual" | "semestral" | "anual";
  /**
   * Depósito reembolsable que cobrará este pago para activar el básico
   * gratis. Null si no aplica: plan de pago, o ya lo pagó.
   */
  depositDue?: { amount: number; currency: string; refundMonths: number } | null;
  /** Depósito ya pagado que sigue retenido, y desde cuándo se devuelve. */
  depositHeld?: { amount: number; currency: string; refundableAt: string } | null;
}
