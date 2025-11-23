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
  role: string;
  __v: number;
}
export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;

  // Caso OTP
  needOTP?: boolean;

  // Caso contraseña temporal
  needActivateTempPassword?: boolean; // ← ESTE es el nombre correcto

  userId?: string;
  message?: string;
  success?: boolean;
}
