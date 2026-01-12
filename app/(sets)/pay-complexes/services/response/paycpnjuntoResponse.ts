export interface payConjuntoResposne {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  neighborhood: string;
  cellphone: string;
  plan: string;
  prices: number;
  currency: string;
  isActive: boolean;
  lastPaymentDate: Date;
  nextPaymentDate: Date;
}
