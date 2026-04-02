interface RegisterConjuntoRequest {
  name: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  typeProperty: string[];
  fundador?: string;
  indicative: string;
  cellphone: string;
  prices: number;
  billingPeriod: "mensual" | "semestral" | "anual";
  plan: string;
  currency: string;
  quantityapt?: number;
  file?: File;
}

export type { RegisterConjuntoRequest };
