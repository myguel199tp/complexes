import { MaintenanceEvidenceType } from "../request/completeMaintenanceRequest";

export interface MaintenanceHistoryResponse {
  id: string;
  completedAt: string;
  cost?: string;
  invoiceNumber?: string;
  /**
   * Ruta local de la evidencia capturada (`/uploads/maintenance/...`) o, en
   * registros antiguos, un enlace externo escrito a mano.
   */
  evidenceUrl?: string | null;
  evidenceType?: MaintenanceEvidenceType | null;
  completedBy?: string | null;
  completionNotes?: string;
  createdAt: string;
}
