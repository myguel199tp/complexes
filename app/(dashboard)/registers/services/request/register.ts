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
  role?: "owner" | "tenant" | "resident" | "visitor" | "employee" | "user";
  conjuntoId?: string;
  numberid?: string;
  pet?: boolean;
  council?: boolean;
}

export type { RegisterRequest };
