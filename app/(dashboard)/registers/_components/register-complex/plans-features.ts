// plan-features.ts

export type PlanFeature = {
  text: string;
  tooltip?: string; // 👈 opcional
  tachado?: boolean; // 👈 opcional
};

export const planFeatures: Record<"basic" | "gold" | "platinum", string[]> = {
  basic: [
    "citofonia",
    "gestion",
    "visitantes",
    "residente",
    "arriendoVenta",
    "alquiler",
    "noticias",
  ],
  gold: [
    "citofonia",
    "subusuario",
    "avisos",
    "gestion",
    "visitantes",
    "residente",
    "arriendoVenta",
    "alquiler",
    "noticias",
    "marketplace",

    "document",
  ],
  platinum: [
    "citofonia",
    "subusuario",
    "avisos",
    "gestion",
    "visitantes",
    "residente",
    "arriendoVenta",
    "alquiler",
    "noticias",
    "marketplace",
    "contabilidad",
    "foro",
    "document",
  ],
};
