export interface SocialRequest {
  iduser: string;
  activity: string;
  description?: string;
  apartment: string;
  reservation_date: string;
  /** Mayores de edad que asisten */
  adultsCount: number;
  /** Menores de edad. Cuentan igual para el aforo. */
  minorsCount: number;
  conjuntoId?: string;
}
