interface Population {
  nameComplet: string;
  numberId: string;
  dateBorn: string;
  relation: string;
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
  numberid: string;
  conjuntoId?: string;
  bornDate?: string;
  pet?: boolean;
  council?: boolean;
  population: Population[];
}

export type { RegisterRequest };
