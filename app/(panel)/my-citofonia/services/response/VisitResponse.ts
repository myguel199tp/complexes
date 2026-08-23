import { VisitStatus } from "./visit";

export interface VisitResponse {
  id: string;
  userId: string;

  namevisit: string;
  numberId: string;

  apartment: string;
  nameUnit?: string;

  visitType: string;
  plaque?: string;

  status: VisitStatus;

  authorizedBy?: string;
  authorizedAt?: string | null;

  entryTime?: string;
  exitTime?: string;

  createdAt: string;

  hasParking: boolean;
  parkingRatePerHour: number;

  /** Celda de visitantes donde quedó el vehículo, si se le asignó una. */
  parkingSpotId?: string | null;
  parkingSpot?: { id: string; code: string; zone?: string | null } | null;
  /** Entró con carro sin celda porque no quedaba ninguna libre. */
  parkingOvercapacity?: boolean;

  /**
   * Cobro congelado en el momento de la salida. Recalcularlo en el cliente hacía
   * que una visita ya pagada cambiara de valor al actualizar la tarifa.
   */
  parkingAmount?: number | null;

  paymentStatus: string;

  /**
   * A nombre de quién va el cobro del parqueadero. El visitante paga en la reja
   * antes de salir; `RESIDENT` queda para las visitas anteriores al cambio y
   * para cuando el residente asume el cobro subiendo el comprobante.
   */
  parkingPayer?: "VISITOR" | "RESIDENT";

  /** Por dónde entró la plata: QR, efectivo al celador o transferencia. */
  parkingPaymentMethod?: "ONLINE" | "CASH" | "TRANSFER" | null;

  /** Cuándo se cerró la cuenta y el reloj dejó de correr. */
  parkingSettledAt?: string | null;

  /** El pago se confirmó contra la pasarela simulada, no contra dinero real. */
  paymentSimulated?: boolean;

  /** Salió con el parqueadero sin pagar, autorizado por portería. */
  exitOverrideReason?: string | null;

  paymentProof?: string | null;

  paymentVerificationStatus?: string;

  paymentDate?: string | null;

  paidBy?: string | null;

  file?: string;
}

/** `allvisits` ya no devuelve el histórico completo sino una página. */
export interface PaginatedVisits {
  data: VisitResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
