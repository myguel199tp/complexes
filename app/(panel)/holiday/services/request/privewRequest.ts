export interface privewRequest {
  holidayId: string;
  startDate: string;
  endDate: string;
  /** Depósito reembolsable (por defecto) o protección de daños. */
  depositMode?: "deposit" | "protection";
}
