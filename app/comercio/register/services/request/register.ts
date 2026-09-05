import { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";

export type ComercioBusinessModel = "b2c" | "b2b";

export interface ComercioRegisterRequest {
  businessModel: ComercioBusinessModel;
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  indicative?: string;
  /** Obligatorio cuando businessModel es "b2b". */
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  /** Solo B2B: sin esto el proveedor no aparece en ninguna búsqueda. */
  serviceCategories?: B2bServiceCategory[];
  /** Solo B2B: vacío se lee como cobertura nacional. */
  coverageCities?: string[];
  website?: string;
  yearsExperience?: number;
  /** Debe ser true; el backend guarda la fecha de aceptación. */
  termsAccepted: boolean;
  logo?: File | null;
}
