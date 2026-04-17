interface VisitResponse {
  namevisit: string;
  numberId: string;
  apartment: string;
  created_at: string;
  visitType: string;
  plaque: string;
  authorizedBy: string;
  file?: File;
  entryTime: string;
  exitTime: string;
  hasParking: string;
  parkingRatePerHour: number;
}

export type { VisitResponse };
