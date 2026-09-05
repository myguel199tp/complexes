import { ContractManagementType } from "../contractInsuranceService";

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

  /** 🏢 Quién administra el arriendo. Los contratos viejos llegan como DIRECT. */
  managementType: ContractManagementType;
  insurerName?: string;
  insurerNit?: string;
  insurerPolicyNumber?: string;
  insurerContactName?: string;
  insurerPhone?: string;
  insurerEmail?: string;
  insurerCoverageStart?: string;
  insurerCoverageEnd?: string;
  insurerPolicyFileUrl?: string;
}
