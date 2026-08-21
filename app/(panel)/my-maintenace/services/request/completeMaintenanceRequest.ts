export interface CompleteMaintenanceRequest {
  cost?: number;
  invoiceNumber?: string;
  /**
   * Enlace externo a la evidencia (ej. el informe del proveedor). La evidencia
   * habitual es la foto o el video que se toma en sitio y viaja como archivo,
   * no por aquí.
   */
  evidenceUrl?: string;
  notes?: string;
}

export type MaintenanceEvidenceType = "IMAGE" | "VIDEO";
