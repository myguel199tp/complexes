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
  // Agrega aquí cualquier otro campo que tengas en tu entidad
}

export interface SearchConjuntoResponse {
  status: number;
  message: string;
  conjunto: Conjunto;
}
