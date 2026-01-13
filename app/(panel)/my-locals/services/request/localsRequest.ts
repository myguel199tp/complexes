// src/locals/services/request/localRequest.ts

export enum LocalOperationType {
  SALE = "SALE",
  RENT = "RENT",
}

export interface CreateLocalRequest {
  name: string;
  plaque: string;
  kindOfBusiness: string;
  ownerName: string;
  ownerLastName: string;
  indicative?: string;
  phone: string;

  operationType: LocalOperationType;

  administrationFee: number;
  rentValue?: number;
  salePrice?: number;

  conjuntoId: string;
}
