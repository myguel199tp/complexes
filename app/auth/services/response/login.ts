export interface User {
  _id: string;
  name: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  termsConditions: boolean;
  __v: number;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  accessToken: string;
}
