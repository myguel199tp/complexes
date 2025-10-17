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

export interface AllPqrResponse {
  id: string;
  type: AllPetitionType;
  radicado: string;
  description: string;
  tower: string;
  apartment: string;
  file: string;
}
