interface UserAdminFee {
  id: string;
  year: number;
  month: number;
  amount: number;
  status?: "pending" | "paid" | "late";
}

interface AdminFee {
  id: string;
  amount: string;
  dueDate: string;
  type: string;
  description: string;
  adminFees: UserAdminFee;
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
  country: string;
  city: string;
  indicative: string;
  email: string;
  phone: string;
  file: string;
}

interface vehicles {
  id: string;
  type: string;
  parkingType: string;
  assignmentNumber: string;
  plaque: string;
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
  vehicles: vehicles[];
}
