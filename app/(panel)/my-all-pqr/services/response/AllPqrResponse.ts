export enum AllPetitionType {
  TRASTEO = "trasteo",
  SERVICIOS_DOMÉSTICOS = "servicio domestico",
  VISITA = "visita",
  VEHICULO = "vehiculo",
  REPARACION = "reparacion",
  ZONA_COMUN = "zona_comun",
  QUEJA = "queja",
  SUGERENCIAS = "sugerencias",
  PERMISO_ESPECIAL = "Permiso especial",
  PROBLEMAS_TÉCNICOS = "Problemas tecnicos",
  ADMINISTRATIVA = "administrativa",
  AUTORIZACION = "autorizacion",
}

export type AllPqrStatus =
  | "pendiente"
  | "en_proceso"
  | "aceptada"
  | "rechazada";

export interface AllPqrResponse {
  id: string;
  type: AllPetitionType;
  radicado: string;
  description: string;
  tower: string;
  apartment: string;
  file: string;
  /**
   * Ruta de la imagen de prueba, si el residente adjuntó una. No es una URL:
   * la foto se pide autenticada con `usePqrEvidence`.
   */
  evidence?: string | null;
  status: AllPqrStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  /** Colaborador al que se le derivó la petición al responderla (opcional). */
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
}
