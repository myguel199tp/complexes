interface AdminFee {
  amount: string;
  dueDate: string;
  paidAt: string | null;
  status: "paid" | "pending";
}

interface Conjunto {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  file: string;
  country: string;
  city: string;
  plan: string;
}

interface User {
  id: string;
  name: string;
  lastName: string;
  numberId: string;
  phone: string;
  file: string;
}

export interface EnsembleResponse {
  id: string;
  tower: string | null;
  apartment: string | null;
  plaque: string;
  role: string;
  isMainResidence: boolean;
  active: boolean;
  conjunto: Conjunto;
  user: User;
  adminFees: AdminFee[];
}
