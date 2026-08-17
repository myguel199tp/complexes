/**
 * El valor tiene que ser idéntico al enum `FeeType` del backend
 * (`create-admin-fee.dto.ts`): `type` se valida con `@IsEnum`, así que
 * cualquier texto distinto —por ejemplo la descripción "Saldo inicial del
 * usuario."— devuelve 400. El texto largo va en `description`/`customName`.
 */
export enum FeeType {
  SALDO_INICIAL = "Saldo inicial",
}

export interface CreateAdminFeeRequest {
  relationId: string;
  amount: number;
  dueDate: string;
  description: string;
  type: FeeType;
}
