interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  termsConditions: boolean;
  nit?: string;
  nameUnit?: string;
  address?: string;
  neighborhood?: string;
  country?: string;
  file?: File | null;
  role?: "owner" | "tenant" | "resident" | "visitor" | "employee" | "user";
  conjuntoId?: string;
  numberid?: string;
}

export type { RegisterRequest };
