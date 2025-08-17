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
  numberid: string;
  plaque: string;
  apartment: string;
  conjuntoId?: string;
}

export type { RegisterRequest };
