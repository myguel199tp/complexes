export enum FeeType {
  CUOTA_DE_ADMINISTRACION = "Cuota de administración",
  CUOTA_EXTRAORDINARIAS = "Cuotas extraordinarias",
  PAGO_DE_PARQUEADERO = "Pago de parqueadero",
  APORTE_FONDO = "Aportes al fondo de reserva",
  MORA = "Intereses por mora",
  MULTAS_Y_SANCIONES = "Multas o sanciones económicas",
  ZONAS_COMUNES = "zonas comunes",
  OTRO = "otro",
}

export interface CreateAdminFeeRequest {
  relationId: string;
  amount: number;
  dueDate: string;
  description: string;
  type: FeeType;
}
