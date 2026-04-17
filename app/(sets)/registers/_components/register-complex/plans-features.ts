export type PlanFeature = {
  text: string;
  tachado?: boolean;
};

export const planFeatures: Record<"basic" | "gold" | "platinum", string[]> = {
  basic: [
    "alianzas",
    "morosidad",
    "marketplace",
    "productos",
    "red",
    "soporte",
    "social",
    "asambleas",
    "balance",
    "citofonia",
    "documentos",
    "foro",
    "agente",
    "locales",
    "mantenimientos",
    "comunciaciones",
    "cartelera",
    "pazsalvos",
    "pqr",
    "colaboradores",
    "familiares",
    "gastos",
    "favoritos",
    "inmuebles",
    "pagos",
    "registroExtermo",
    "registroInterno",
  ],
  gold: ["alianzas", "morosidad", "marketplace", "red", "soporte", "agente"],
  platinum: [
    "alianzas",
    "morosidad",
    "marketplace",
    "red",
    "soporte",
    "agente",
  ],
};
