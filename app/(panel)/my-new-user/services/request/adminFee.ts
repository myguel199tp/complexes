export enum FeeType {
  SALDO_INICIAL = "Saldo inicial del usuario.",
}

export interface CreateAdminFeeRequest {
  relationId: string;
  amount: number;
  dueDate: string;
  description: string;
  type: FeeType;
}
