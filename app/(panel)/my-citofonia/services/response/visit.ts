export enum VisitStatus {
  PENDING = "PENDING",
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
  paymentProof: string | null;
  paymentVerificationStatus: string;
  paymentReviewedBy: string | null;
  paymentReviewedAt: string | null;
}
