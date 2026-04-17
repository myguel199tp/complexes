export enum VisitStatus {
  PENDING = "PENDING",
  INSIDE = "INSIDE",
  FINISHED = "FINISHED",
  DENIED = "DENIED",
}

export interface Visit {
  id: string;
  namevisit: string;
  numberId: string;
  nameUnit: string;
  apartment: string;
  plaque?: string;
  file?: string;
  visitType: string;
  status: VisitStatus;
  entryTime?: string;
  exitTime?: string;
  createdAt: string;
  conjuntoId: string;
  authorizedBy?: string;
  hasParking: string;
  parkingRatePerHour: number;
}
