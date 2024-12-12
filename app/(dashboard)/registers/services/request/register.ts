interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  password: string;
  termsConditions: boolean;
  nameUnit?: string; // Opcional
  address?: string; // Opcional
  neigborhood?: string; // Opcional
  country?: string; // Opcional
  file?: File | null; // Opcional y acepta null
}

export type { RegisterRequest };
