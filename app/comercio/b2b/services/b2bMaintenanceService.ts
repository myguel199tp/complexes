import { comercioFetch } from "../../_lib/comercio-api";

export type B2bMaintenanceStatus = "PENDING" | "OVERDUE";

export type B2bMaintenanceFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "ANNUAL";

export const FREQUENCY_LABELS: Record<B2bMaintenanceFrequency, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
};

/**
 * Un servicio programado a cargo del comercio en algún conjunto donde figura
 * como proveedor.
 *
 * Es de solo lectura: quien certifica que el trabajo se hizo y sube la
 * evidencia sigue siendo la administración del conjunto.
 */
export interface B2bMaintenance {
  id: string;
  conjuntoId: string;
  conjuntoName: string;
  commonAreaName: string;
  frequency: B2bMaintenanceFrequency;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: B2bMaintenanceStatus;
  notes?: string;
  contractId?: string;
  /** false si la alianza que lo originó está cancelada o suspendida. */
  providerActive: boolean;
}

export function getB2bMaintenances() {
  return comercioFetch<B2bMaintenance[]>("/comercio/b2b/maintenances");
}
