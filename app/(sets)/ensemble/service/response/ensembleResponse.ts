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
}

interface User {
  id: string;
  name: string;
  lastName: string;
  phone: string;
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
