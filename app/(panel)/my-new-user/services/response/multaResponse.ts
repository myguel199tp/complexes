export interface MultaResponse {
  id: string;

  title: string;

  reason: string;

  amount: number;

  dueDate: string;

  incidentDate?: string;

  evidenceUrl?: string;

  status: string;

  relationId: string;

  conjuntoId: string;

  createdById?: string;

  adminFeeId?: string;

  createdAt: string;
}
