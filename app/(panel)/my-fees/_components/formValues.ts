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

  feeType?: FeeType;

  specificMonths?: number[];
};
