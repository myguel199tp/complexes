/** Promoción vigente tal como la publica `GET /campaigns/active`. */
export interface ActiveCampaign {
  id: string;
  name: string;
  benefitType: "PERCENT" | "FIXED_AMOUNT" | "OVERRIDE_PRICE" | "BONUS_MONTHS";
  percentOff?: number | null;
  amountOff?: number | null;
  overridePrice?: number | null;
  bonusMonths?: number | null;
  appliesToPeriods?: number | null;
}

export interface ActiveCampaignsResponse {
  campaigns: ActiveCampaign[];
  /**
   * Sólo viene cuando se consultó con un cupón. `false` significa que el
   * código no existe o no aplica a este conjunto; el precio, de todos modos,
   * lo decide el servidor.
   */
  couponValid?: boolean;
}
