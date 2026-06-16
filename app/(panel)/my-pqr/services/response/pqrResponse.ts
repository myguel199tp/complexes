export enum PetitionType {
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

export type PqrStatus = "pendiente" | "en_proceso" | "aceptada" | "rechazada";

export interface PqrResponse {
  id: string;
  type: PetitionType;
  radicado: string;
  description: string;
  tower: string;
  apartment: string;
  file: string;
  status: PqrStatus;
  resolution?: string;
}
