export enum MaintenanceStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  OVERDUE = "OVERDUE",
}

export enum MaintenanceFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUAL = "SEMIANNUAL",
  ANNUAL = "ANNUAL",
}

export interface CreateMaintenanceRequest {
  conjuntoId: string;
  commonAreaId: string;
  providerId: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  frequency: MaintenanceFrequency;
  status?: MaintenanceStatus;
  notes?: string;
}
