export interface WarningRequest {
  relationId: string;

  title: string;

  reason: string;

  incidentDate?: string;

  /** Plazo para corregir la conducta (yyyy-mm-dd). */
  correctionDeadline?: string;

  evidenceUrl?: string;
}
