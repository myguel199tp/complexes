export enum FeeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NOTIFIED = "NOTIFIED",
  OVERDUE = "OVERDUE",
  /**
   * El residente ya subió el comprobante y falta que la administración lo
   * verifique. Faltaba aquí, así que la bandeja de verificación no reconocía el
   * estado que devuelve el backend.
   */
  IN_REVIEW = "IN_REVIEW",
}

interface UserAdminFee {
  id: string;
  year: number;
  month: number;
  amount: number;
  status?: "pending" | "paid" | "late" | "notified";
}

export interface AdminFee {
  id: string;
  amount: string;
  /**
   * Abonos ya verificados por la administración. Una cuota puede llevar dinero
   * recibido sin estar APPROVED todavía: sin este campo ese dinero no se veía
   * ni como ingreso ni descontado de la deuda.
   */
  paidAmount?: string | number | null;
  dueDate: string;
  type: string;
  description: string;
  adminFees: UserAdminFee;
  file: string;
  status: FeeStatus;
  customName?: string;
  valuepay?: string | null;
  paidAt?: string | null;
  rejectionReason?: string | null;
  /** Referencia bancaria cuando el pago se reportó por el chat del asistente. */
  paymentReference?: string | null;
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
  lastComplet: string;
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
  id: string;
  type: string;
  radicado: string;
  description: string;
  numberId: string;
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
  isBrigadeMember?: boolean;
  conjunto: Conjunto;
  user: User;
  certification: certification[];
  adminFees: AdminFee[];
  vehicles: Vehicles[];
}
