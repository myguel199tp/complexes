export const USER_ROLES = [
  "owner",
  "tenant",
  "resident",
  "visitor",
  "user",
  "family",
  "employee",
  "porter",
  "cleaner",
  "maintenance",
  "gardener",
  "pool_technician",
  "accountant",
  "messenger",
  "logistics_assistant",
  "community_manager",
  "trainer",
  "event_staff",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export interface FamilyInfo {
  relation?: string;
  nameComplet?: string;
  numberId?: string;
  email?: string;
  dateBorn?: string;
  phones?: string;
  indicative?: string;
  indicatine?: string;
  file?: File | null;
}

interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  indicative: string;
  email: string;
  termsConditions: boolean;
  nameUnit?: string;
  nit?: string;
  address?: string;
  neigborhood?: string;
  country?: string;
  referralCode?: string;
  file?: File | null;
  roles?: UserRole[];
  numberId: string;
  conjuntoId?: string;
  bornDate?: string;
  pet?: boolean;
  council?: boolean;
  familyInfo?: FamilyInfo[];
}

export type { RegisterRequest };
