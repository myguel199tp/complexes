export interface CreateDemonstrationRequest {
  email?: string;
  message?: string;
  indicative?: string;
  nameUnit?: string;
  fullName?: string;
  phone?: string;
  quantityUnits?: number;
  /**
   * Promoción a la que el solicitante dijo querer aplicar. El nombre viaja
   * junto al id porque la campaña puede editarse o vencerse antes de que el
   * asesor atienda la solicitud.
   */
  campaignId?: string;
  campaignName?: string;
}
