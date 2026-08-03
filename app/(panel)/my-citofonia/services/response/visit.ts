export enum VisitStatus {
  PENDING = "PENDING",
  /**
   * El residente aprobó, pero el visitante todavía no ha cruzado la reja. Antes
   * `authorize` saltaba directo a INSIDE y el tiempo de permanencia se contaba
   * desde la aprobación.
   */
  AUTHORIZED = "AUTHORIZED",
  INSIDE = "INSIDE",
  FINISHED = "FINISHED",
  DENIED = "DENIED",
}

export interface Visit {
  id: string;
  userId: string;
  namevisit: string;
  numberId: string;
  nameUnit: string;
  apartment: string;
  hasParking: boolean;
  paymentStatus: string;
  paymentDate: string | null;
  paidBy: string | null;
  parkingRatePerHour: number;
  /** Cobro congelado al salir. Manda sobre cualquier cálculo del cliente. */
  parkingAmount: number | null;
  plaque: string;
  photoUrl: string;
  documentPhotoUrl: string;
  file: string;
  visitType: string;
  status: VisitStatus;
  entryTime: string;
  exitTime: string | null;
  createdAt: string;
  conjuntoId: string;
  authorizedBy: string;
  authorizedAt: string | null;
  relationId: string | null;
  paymentProof: string | null;
  paymentVerificationStatus: string;
  paymentReviewedBy: string | null;
  paymentReviewedAt: string | null;
}
