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

interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  termsConditions: boolean;
  bornDate: string;
  indicative: string;

  nit?: string;
  nameUnit?: string;
  address?: string;
  neighborhood?: string;
  country?: string;
  file?: File | null;

  // 👇 AHORA COINCIDE 1:1 CON BACKEND
  roles?: UserRole[];

  conjuntoId?: string;
  numberId?: string;
  pet?: boolean;
  council?: boolean;
}

export type { RegisterRequest };
