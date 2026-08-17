// types/form-values.ts
import { FeeType } from "../services/admin-fee-payment";

export type FormValues = {
  lastPaymentDate?: string;
  amount?: number;
  currency?: string;
  recommendedSchedule?: string;

  digitalPaymentEnabled?: boolean;
  digitalPaymentUrl?: string;

  showMessageDaysBefore?: number;

  monthsToGenerate?: number;

  /** Cada cuántos meses se repite la cuota (1 = mensual, 3 = trimestral…). */
  intervalMonths?: number;

  /** Cuentas a las que el residente debe consignar. */
  bankAccountIds?: string[];

  feeType?: FeeType;

  specificMonths?: number[];

  parkingRatePerHour?: number;

  /** Interés de mora mensual (%). Vacío = el conjunto no cobra mora. */
  moraRatePercent?: number;

  /**
   * Días de mora desde los que la cartera sugiere trasladar a cobro jurídico.
   * Vacío = no se sugiere ninguna unidad.
   */
  legalThresholdDays?: number;
};
