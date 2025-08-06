interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  password: string;
  termsConditions: boolean;
  nit?: string;
  nameUnit?: string;
  address?: string;
  neighborhood?: string;
  country?: string;
  file?: File | null;
  rol: string;
}

export type { RegisterRequest };
