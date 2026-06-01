export interface MultaRequest {
  relationId: string;

  title: string;

  reason: string;

  amount: number;

  dueDate: string;

  incidentDate?: string;

  evidenceUrl?: string;
}
