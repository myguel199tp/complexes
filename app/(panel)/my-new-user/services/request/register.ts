interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  password: string;
  termsConditions: boolean;
  nameUnit?: string;
  address?: string;
  neigborhood?: string;
  country?: string;
  file?: File | null;
  rol: string;
  numberid: string;
  plaque: string;
  apartment: string;
}

export type { RegisterRequest };
