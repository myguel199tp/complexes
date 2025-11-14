interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  termsConditions: boolean;
  nameUnit?: string;
  nit?: string;
  address?: string;
  neigborhood?: string;
  country?: string;
  file?: File | null;
  role: string;
  numberId: string;
  conjuntoId?: string;
  bornDate?: string;
}

export type { RegisterRequest };
