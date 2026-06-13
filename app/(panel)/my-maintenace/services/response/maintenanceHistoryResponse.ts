export interface MaintenanceHistoryResponse {
  id: string;
  completedAt: string;
  cost?: string;
  invoiceNumber?: string;
  evidenceUrl?: string | null;
  completedBy?: string | null;
  completionNotes?: string;
  createdAt: string;
}
