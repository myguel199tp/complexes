export interface EnsembleResponse {
  id: string;
  apartment: string;
  tower: string;
  plaque: string | null;
  role: string;
  isMainResidence: boolean;
  active: boolean;
  conjunto: {
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
  };
  user: {
    file: string;
    id: string;
    name: string;
    lastName: string;
  };
}
