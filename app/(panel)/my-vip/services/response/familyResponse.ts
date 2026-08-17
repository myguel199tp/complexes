export interface FamilyMember {
  relationId: string;
  id: string;
  name: string;
  lastName: string;
  email: string;
  numberId: string;
  phone?: string;
  indicative?: string;
  bornDate?: string;
  tower?: string | null;
  apartment?: string | null;
  /** Falso mientras el familiar no abra el enlace del correo y cree su clave. */
  isActive: boolean;
  createdAt: string;
}

export interface FamilyQuotaResponse {
  /** Plan del conjunto: basic | gold | platinum. */
  plan: string;
  maxAllowed: number;
  used: number;
  available: number;
  members: FamilyMember[];
}

export type FamilyRegisterStatus =
  | "created"
  | "linked"
  | "already_related"
  | "error";

export interface FamilyRegisterResult {
  email: string;
  id?: string;
  status: FamilyRegisterStatus;
  message?: string;
}

export interface RegisterFamilyResponse {
  message: string;
  conjuntoId: string;
  plan: string;
  maxAllowed: number;
  used: number;
  available: number;
  results: FamilyRegisterResult[];
}

export const PLAN_LABEL: Record<string, string> = {
  basic: "Básico",
  gold: "Oro",
  platinum: "Platino",
};

export function planLabel(plan?: string): string {
  return PLAN_LABEL[plan ?? ""] ?? "Básico";
}
