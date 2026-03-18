export interface Conjunto {
  id: string;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  cellphone: string;
  prices: number;
  quantityapt: number;
  file: string;
}

export interface SearchConjuntoResponse {
  status: number;
  message: string;
  conjunto: Conjunto;
}
