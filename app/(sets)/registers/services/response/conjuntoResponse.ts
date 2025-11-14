export interface Conjunto {
  id: number;
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  cellphone: string;
  prices: number;
  quantityapt?: number;
  file?: string;
}

export interface RegisterConjuntoResult {
  message: string;
  id: number;
  conjunto: Conjunto;
}

export interface RegisterConjuntoResponse {
  status: number;
  data: RegisterConjuntoResult;
}
