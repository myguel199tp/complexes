export interface ContractResponse {
  id: string;
  ownerId: string;
  tenantId: string;
  tower: string;
  apartment: string;
  rentAmount: number;
  paymentDay: number;
  startDate: string;
  endDate: string;
  notes?: string;
  fileUrl: string;
  satatus: string;
  totalPayments: number;
  createdAt: string;
  updatedAt: string;
}
