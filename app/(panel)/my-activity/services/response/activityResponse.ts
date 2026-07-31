export interface ActivityResponse {
  id: string;
  status: boolean;
  /** Aforo total en personas */
  cuantity: number;
  /** Tope de personas por apartamento; null = sin tope */
  maxPerApartment?: number | null;
  inChargue: string;
  nameUnit: string;
  activity: string;
  description: string;
  dateHourStart: string;
  dateHourEnd: string;
  file: string;
}
