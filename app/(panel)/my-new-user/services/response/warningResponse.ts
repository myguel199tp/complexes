import { MultaResponse } from "./multaResponse";

export type WarningStatus = "notified" | "cancelled";

/** Lo mínimo de la relación que trae el historial, para decir a quién fue. */
export interface HistoryRelation {
  id: string;
  namesuer?: string | null;
  tower?: string | null;
  apartment?: string | null;
  user?: { name?: string | null; lastName?: string | null } | null;
}

export interface WarningResponse {
  id: string;

  title: string;

  reason: string;

  incidentDate?: string | null;

  correctionDeadline?: string | null;

  evidenceUrl?: string | null;

  status: WarningStatus;

  relationId: string;

  relation?: HistoryRelation;

  createdAt: string;
}

/** Llamados y multas de la unidad: lo que se mira antes de multar. */
export interface UnitHistoryResponse {
  unit: string;
  warnings: WarningResponse[];
  fines: (MultaResponse & { relation?: HistoryRelation; warningId?: string | null })[];
  activeWarnings: number;
  /** Texto de la recomendación cuando no hay llamados vigentes. */
  recommendation: string | null;
}
