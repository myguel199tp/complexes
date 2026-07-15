import { comercioFetch } from "./comercio-api";

export type ComercioBusinessModel = "b2c" | "b2b";

export interface ComercioProfile {
  id: string;
  businessModel: ComercioBusinessModel;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  country?: string;
}

export function getComercioProfile() {
  return comercioFetch<ComercioProfile>("/comercio-auth/profile");
}
