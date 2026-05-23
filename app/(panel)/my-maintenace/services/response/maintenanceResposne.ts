export enum MaintenanceStatus {
  PENDING = "PENDING",
  OVERDUE = "OVERDUE",
}

export enum MaintenanceFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUAL = "SEMIANNUAL",
  ANNUAL = "ANNUAL",
}

export interface MaintenanceResponse {
  id: string;
  conjunto: {
    id: string;
    name: string;
  };
  commonArea: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
    service: string;
  };
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  frequency: MaintenanceFrequency;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: Date;
  completedAt?: string;
  cost?: number;
  invoiceNumber?: string;
  evidenceUrl?: string;
  completionNotes?: string;
}
