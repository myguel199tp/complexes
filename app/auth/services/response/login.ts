export interface User {
  id: string;
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  termsConditions: boolean;
  nameUnit: string;
  address?: string;
  neigborhood?: string;
  nit?: string;
  country: string;
  file: string;
  rol: string;
  __v: number;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  accessToken: string;
}
