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
  /**
   * true cuando el route handler ya dejó la sesión abierta en cookies httpOnly.
   * Los tokens ya no viajan al cliente: sustituyen a accessToken/refreshToken.
   */
  authenticated?: boolean;
  roles?: string[];
  needOTP?: boolean;

  needActivateTempPassword?: boolean;

  userId?: string;
  message?: string;
  success?: boolean;
}
