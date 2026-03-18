export type PlanFeature = {
  text: string;
  tooltip?: string;
  tachado?: boolean;
};

export const planFeatures: Record<"basic" | "gold" | "platinum", string[]> = {
  basic: ["reparto", "alianzas", "morosidad", "marketplace", "red", "soporte"],
  gold: ["reparto", "alianzas", "morosidad", "marketplace", "red", "soporte"],
  platinum: [
    "reparto",
    "alianzas",
    "morosidad",
    "marketplace",
    "red",
    "soporte",
  ],
};
