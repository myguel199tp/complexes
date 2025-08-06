interface RegisterConjuntoRequest {
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  cellphone: string;
  prices: number;
  quantityapt?: number;
  file?: File;
}

export type { RegisterConjuntoRequest };
