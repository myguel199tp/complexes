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
  role: string;
  conjuntoId: string;
  numberid: string;
}

export type { RegisterRequest };
