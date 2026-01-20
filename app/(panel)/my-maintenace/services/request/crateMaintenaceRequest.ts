export enum MaintenanceStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  OVERDUE = "OVERDUE",
}

export enum MaintenanceFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUAL = "SEMIANNUAL",
  ANNUAL = "ANNUAL",
}

export interface CreateMaintenanceRequest {
  conjuntoId?: string;
  commonAreaId: string;
  providerId: string;
  lastMaintenanceDate: string;
  frequency: MaintenanceFrequency;
  notes?: string;
}
