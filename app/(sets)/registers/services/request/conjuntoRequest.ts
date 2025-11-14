interface RegisterConjuntoRequest {
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  typeProperty: string[];
  indicative: string;
  cellphone: string;
  prices: number;
  plan: string;
  quantityapt?: number;
  file?: File;
}

export type { RegisterConjuntoRequest };
