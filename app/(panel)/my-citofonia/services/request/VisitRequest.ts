interface VisitRequest {
  namevisit: string;
  numberId: string;
  apartment: string;
  startHour: string;
  plaque: string;
  file?: File | null;
}

export type { VisitRequest };
