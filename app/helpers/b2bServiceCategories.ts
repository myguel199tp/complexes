/**
 * Vocabulario de servicios B2B, compartido por los dos paneles.
 *
 * El conjunto lo usa para publicar lo que necesita y para buscar proveedores;
 * el comercio, para clasificar los planes que publica. Vive aquí y no dentro de
 * uno de los dos porque son la misma lista: si cada panel tuviera la suya,
 * bastaría con que alguien agregara un servicio de un solo lado para que la
 * búsqueda dejara de encontrar lo que el otro ofrece.
 *
 * Debe coincidir con el enum `B2bDemandCategory` del backend.
 */
export type B2bServiceCategory =
  | "fachada_pintura"
  | "impermeabilizacion"
  | "jardineria"
  | "aseo"
  | "seguridad"
  | "ascensores"
  | "piscina"
  | "energia_solar"
  | "hidraulica"
  | "electrica"
  | "control_acceso"
  | "fumigacion"
  | "otro";

export const B2B_SERVICE_CATEGORIES: {
  value: B2bServiceCategory;
  label: string;
}[] = [
  { value: "fachada_pintura", label: "Fachada y pintura" },
  { value: "impermeabilizacion", label: "Impermeabilización y cubiertas" },
  { value: "jardineria", label: "Jardinería y zonas verdes" },
  { value: "aseo", label: "Aseo y personal de limpieza" },
  { value: "seguridad", label: "Vigilancia y seguridad" },
  { value: "ascensores", label: "Ascensores" },
  { value: "piscina", label: "Piscina" },
  { value: "energia_solar", label: "Energía solar y eficiencia" },
  { value: "hidraulica", label: "Hidráulica y bombas" },
  { value: "electrica", label: "Instalaciones eléctricas" },
  { value: "control_acceso", label: "Control de acceso y citofonía" },
  { value: "fumigacion", label: "Fumigación y control de plagas" },
  { value: "otro", label: "Otro servicio" },
];

export const B2B_SERVICE_CATEGORY_LABELS = B2B_SERVICE_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<B2bServiceCategory, string>,
);
