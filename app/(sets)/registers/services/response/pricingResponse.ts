export interface PricingPlanDetail {
  total: number;
  /** El plan básico de conjuntos pequeños: no se cobra. */
  isFree?: boolean;
  /** Ciclos que cubre el total (1 mensual, 6 semestral, 12 anual). */
  months: number;
  /** Descuento por periodicidad, en porcentaje. */
  discountApplied?: number;
  discountAmount?: number;
  /**
   * Lo que quitó la promoción de campaña, sin impuesto. Va aparte del
   * descuento por periodicidad porque son dos rebajas distintas y el cliente
   * tiene derecho a ver cuál le tocó.
   */
  campaignDiscountAmount?: number;
  /**
   * Meses de regalo. No bajan el total: corren la próxima fecha de pago, así
   * que se anuncian como tiempo extra y nunca como descuento.
   */
  campaignBonusMonths?: number;
  /**
   * Lo que costaría sin la promoción, con impuesto. Es el precio que se tacha:
   * `campaignDiscountAmount` va sin impuesto y `total` con él, así que restarlos
   * daría un "antes" que nadie iba a pagar.
   */
  campaignTotalBefore?: number;
}

/** Promoción que el backend alcanzó a aplicar en la cotización. */
export interface PricingCampaign {
  id: string;
  name: string;
  benefitType: "PERCENT" | "FIXED_AMOUNT" | "OVERRIDE_PRICE" | "BONUS_MONTHS";
  bonusMonths?: number | null;
  appliesToPeriods?: number | null;
  /** Viene de una redención abierta del conjunto, no de la campaña viva. */
  fromRedemption?: boolean;
}

/**
 * Códigos que devuelve el backend cuando no puede cotizar. Vienen con
 * `plans: null`, por eso el consumidor siempre debe comprobar `plans` antes
 * de leerlo.
 */
export type PricingErrorCode =
  | "COUNTRY_DISABLED"
  | "MIN_APARTMENTS"
  | "MONTHLY_NOT_ALLOWED_UNDER_30";

export interface PricingResponse {
  plans: {
    basic: PricingPlanDetail;
    gold: PricingPlanDetail;
    platinum: PricingPlanDetail;
  } | null;
  error?: PricingErrorCode;
  currency: string;
  locale: string;
  billingPeriod: string;
  founderDiscountApplied?: boolean;
  /** true cuando el básico salió gratis por el tamaño del conjunto. */
  basicIsFree?: boolean;
  /** Desde cuántas unidades el básico deja de ser gratis. */
  freeBasicMaxApartments?: number;
  /** Vacío cuando no hay ninguna campaña vigente para este conjunto. */
  campaigns?: PricingCampaign[];
}
