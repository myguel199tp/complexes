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

export interface FamilyInfo {
  nameComplet: string;
  numberId: string;
  dateBorn: string;
  relation: string;
  email: string;
  phones: string;
  indicative: string;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  numberId: string;
  city: string;
  country: string;
  indicative: string;
  email: string;
  phone: string;
  file: string;
  pet: boolean;
  council: boolean;
  bornDate: string;
  familyInfo: FamilyInfo[];
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
