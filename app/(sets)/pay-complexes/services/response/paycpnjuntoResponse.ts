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
  /** Básico de por vida: activo y sin próximo pago. */
  lifetimeBasic?: boolean;
  /** Licencia del básico vigente y desde cuándo, o null si no la tiene. */
  basicLicense?: {
    acquiredAt: string;
    source: string;
    historyPaidUntil: string | null;
  } | null;
  /**
   * Historial del básico de por vida. `visibleSince` es desde cuándo se ve
   * (null = completo); `offer`, lo que cuesta el próximo año, o null si no le
   * toca pagarlo (oro, platino o sin licencia).
   */
  history?: {
    visibleSince: string | null;
    months: number;
    offer: {
      amount: number;
      taxAmount: number;
      total: number;
      currency: string;
      paidUntil: string | null;
    } | null;
  };
  /**
   * Lo que costaría la licencia si no la tiene y se le ofrece. Con oro o
   * platino es el opcional que evita que se desactive al no renovar.
   */
  basicLicenseOffer?: {
    amount: number;
    taxAmount: number;
    total: number;
    currency: string;
  } | null;
  /**
   * Lo que cobra "Pagar" sin opcionales, calculado en el servidor. `LICENSE`
   * es el básico de pago único; `PLAN`, un periodo del plan.
   */
  checkout?: {
    concept: "PLAN" | "LICENSE" | "HISTORY";
    plan: string;
    planAmount: number;
    licenseAmount: number;
    amount: number;
    currency: string;
  } | null;
  /** Depósito ya pagado que sigue retenido, y desde cuándo se devuelve. */
  depositHeld?: { amount: number; currency: string; refundableAt: string } | null;
}
