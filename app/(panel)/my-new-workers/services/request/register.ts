export interface FamilyInfo {
  relation?: string;
  nameComplet?: string;
  numberId?: string;
  email?: string;
  dateBorn?: string;
  phones?: string;
  indicative?: string;
  indicatine?: string;
  file?: File | null;
}

interface RegisterRequest {
  name: string;
  lastName: string;
  city: string;
  phone: string;
  indicative: string;
  email: string;
  termsConditions: boolean;
  nameUnit?: string;
  nit?: string;
  address?: string;
  neigborhood?: string;
  country?: string;
  file?: File | null;
  role: string;
  numberId: string;
  conjuntoId?: string;
  bornDate?: string;
  pet?: boolean;
  council?: boolean;
  familyInfo?: FamilyInfo[];
}

export type { RegisterRequest };
