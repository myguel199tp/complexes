export interface VisitResponse {
  id: string;
  userId: string;

  namevisit: string;
  numberId: string;

  apartment: string;
  nameUnit?: string;

  visitType: string;
  plaque?: string;

  status: string;

  authorizedBy?: string;

  entryTime?: string;
  exitTime?: string;

  createdAt: string;

  hasParking: boolean;
  parkingRatePerHour: number;

  paymentStatus: string;

  paymentProof?: string | null;

  paymentVerificationStatus?: string;

  paymentDate?: string | null;

  paidBy?: string | null;

  file?: string;
}
