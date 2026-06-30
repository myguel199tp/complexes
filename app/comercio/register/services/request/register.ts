export interface ComercioRegisterRequest {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  indicative?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
}
