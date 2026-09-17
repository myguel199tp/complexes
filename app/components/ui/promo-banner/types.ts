/** Promoción tal como la publica `GET /campaigns/showcase`. */
export interface ShowcaseCampaign {
  id: string;
  name: string;
  description: string | null;
  benefitType: "PERCENT" | "FIXED_AMOUNT" | "OVERRIDE_PRICE" | "BONUS_MONTHS";
  /** Fracción: 0.15 = 15%. */
  percentOff: number;
  amountOff: number;
  overridePrice: number;
  bonusMonths: number;
  appliesToPeriods: number | null;
  /**
   * Hay que pedir un código para tomarla. El código nunca viaja hasta aquí: se
   * entrega en la demostración, que es donde el asesor decide a quién dárselo.
   */
  requiresCoupon: boolean;
  /** Nulo = no vence sola. */
  endsAt: string | null;
  /**
   * Rangos de la campaña. Vienen para poder decir a quién le sirve, no para
   * esconder la promoción: el visitante de la portada todavía no ha dicho
   * cuántas unidades tiene.
   */
  minApartments: number | null;
  maxApartments: number | null;
  billingPeriods: string[];
  plans: string[];
}

export interface ShowcaseResponse {
  campaigns: ShowcaseCampaign[];
}
