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

  /**
   * Cobro congelado en el momento de la salida. Recalcularlo en el cliente hacía
   * que una visita ya pagada cambiara de valor al actualizar la tarifa.
   */
  parkingAmount?: number | null;

  paymentStatus: string;

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
