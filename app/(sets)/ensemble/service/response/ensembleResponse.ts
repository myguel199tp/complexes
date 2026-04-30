export enum FeeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

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
  file: string;
  status: FeeStatus;
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
  isActive: boolean;
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
  isActive: string;
  bornDate: string;
  familyInfo: FamilyInfo[];
}

export interface Vehicles {
  id: string;
  type: string;
  parkingType: string;
  assignmentNumber: string;
  plaque: string;
}

interface certification {
  id: "d319ebd0-cb42-435c-837d-cd3d972db71f";
  type: "Paz y salvo por servicios comunes";
  radicado: "E1V3R";
  description: "Certifica que el propietario ha cumplido con los pagos de los servicios comunes.";
  numberId: "";
  file: "uploads\\pdfs\\E1V3R-1776478538199.pdf";
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
  certification: certification[];
  adminFees: AdminFee[];
  vehicles: Vehicles[];
}
