export enum FeeType {
  CUOTA_DE_ADMINISTRACION = "Cuota de administración",
  CUOTA_EXTRAORDINARIAS = "Cuotas extraordinarias",
  PAGO_DE_PARQUEADERO = "Pago de parqueadero",
  APORTE_FONDO = "Aportes al fondo de reserva",
  MORA = "Intereses por mora",
  MULTAS_Y_SANCIONES = "Multas o sanciones económicas",
  ZONAS_COMUNES = "zonas comunes",
}

export interface CreateAdminFeePaymentDto {
  lastPaymentDate?: string;
  amount?: number;
  currency?: string;
  recommendedSchedule?: string;
  digitalPaymentEnabled?: boolean;
  digitalPaymentUrl?: string;
  showMessageDaysBefore?: number;

  // NUEVOS CAMPOS
  monthsToGenerate?: number;

  /**
   * Cada cuántos meses se repite la cuota (1 = mensual, 3 = trimestral…).
   *
   * El backend ya lo soportaba pero el formulario nunca lo enviaba: el select
   * de "Frecuencia" solo guardaba `recommendedSchedule`, un texto que la
   * generación no lee, así que todo se generaba mes a mes.
   */
  intervalMonths?: number;

  feeType?: FeeType;

  specificMonths?: number[];

  parkingRatePerHour?: number;

  /** Interés de mora mensual (%). Vacío = el conjunto no cobra mora. */
  moraRatePercent?: number;

  /**
   * Días de mora desde los que la cartera marca una unidad como candidata a
   * cobro jurídico. Solo sugiere: el traslado siempre lo decide una persona.
   */
  legalThresholdDays?: number;

  /**
   * Cuentas a las que el residente debe consignar.
   *
   * El campo existía en el backend pero el formulario no lo enviaba nunca, así
   * que la configuración quedaba sin cuentas y el residente veía cuánto debía
   * sin saber dónde pagarlo.
   */
  bankAccountIds?: string[];
}

export interface AdminFeePaymentBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface AdminFeePayment {
  id: string;
  conjuntoId: string;
  lastPaymentDate?: string;
  amount?: number;
  currency?: string;
  recommendedSchedule?: string;
  digitalPaymentEnabled?: boolean;
  digitalPaymentUrl?: string;
  showMessageDaysBefore?: number;
  monthsToGenerate?: number;
  intervalMonths?: number;
  feeType?: FeeType;
  specificMonths?: number[];
  parkingRatePerHour?: number;
  moraRatePercent?: number;
  legalThresholdDays?: number;
  bankAccounts?: AdminFeePaymentBankAccount[];
  createdAt: string;
}
