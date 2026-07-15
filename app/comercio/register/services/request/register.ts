export type ComercioBusinessModel = "b2c" | "b2b";

export interface ComercioRegisterRequest {
  businessModel: ComercioBusinessModel;
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
  logo?: File | null;
}
