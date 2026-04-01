export type PlanFeature = {
  text: string;
  tachado?: boolean;
};

export const planFeatures: Record<"basic" | "gold" | "platinum", string[]> = {
  basic: ["alianzas", "morosidad", "marketplace", "red", "soporte"],
  gold: ["alianzas", "morosidad", "marketplace", "red", "soporte"],
  platinum: ["alianzas", "morosidad", "marketplace", "red", "soporte"],
};
