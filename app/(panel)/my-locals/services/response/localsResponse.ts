export enum LocalOperationType {
  SALE = "SALE",
  RENT = "RENT",
}

export interface CreateLocalResponse {
  id: string;
  name: string;
  plaque: string;
  kindOfBusiness: string;
  ownerName: string;
  ownerLastName: string;
  indicative?: string;
  phone: string;

  operationType: LocalOperationType;

  /** Lo que el local le paga al conjunto por administración, al mes. */
  administrationFee: number;
  /** Canon del arriendo. Es ingreso del dueño del local, no del conjunto. */
  rentValue?: number;
  /**
   * Precio de venta, también del dueño. El backend lo llama `adminPrice`; el
   * tipo decía `salePrice`, un campo que nunca llega y que nadie leía.
   */
  adminPrice?: number;

  conjuntoId: string;
}
