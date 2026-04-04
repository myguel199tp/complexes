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
  paymentPlaces?: string[];
  recommendedSchedule?: string;
  digitalPaymentEnabled?: boolean;
  digitalPaymentUrl?: string;
  showMessageDaysBefore?: number;

  // NUEVOS CAMPOS
  monthsToGenerate?: number;
  feeType?: FeeType;
  specificMonths?: number[];
}

export interface AdminFeePayment {
  id: string;
  conjuntoId: string;
  lastPaymentDate?: string;
  amount?: number;
  currency?: string;
  paymentPlaces?: string[];
  recommendedSchedule?: string;
  digitalPaymentEnabled?: boolean;
  digitalPaymentUrl?: string;
  showMessageDaysBefore?: number;

  // NUEVOS CAMPOS
  monthsToGenerate?: number;
  feeType?: FeeType;
  specificMonths?: number[];

  createdAt: string;
}
