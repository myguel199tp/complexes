export enum VehicleType {
  CAR = "carro",
  MOTORCYCLE = "moto",
}

// Enum para tipo de parqueadero
export enum ParkingType {
  PUBLIC = "publico",
  PRIVATE = "privado",
}

export interface vehicless {
  type: VehicleType;
  parkingType: ParkingType;
  assignmentNumber?: string;
  plaque: string;
}

export enum UserRole {
  OWNER = "owner",
  TENANT = "tenant",
  RESIDENT = "resident",
  VISITOR = "visitor",
  USER = "user",
  FAMILY = "family",
  EMPLOYEE = "employee",
  PORTER = "porter",
  CLEANER = "cleaner",
  MAINTENANCE = "maintenance",
  GARDENER = "gardener",
  POOL_TECH = "pool_technician",
  ACCOUNTANT = "accountant",
  MESSENGER = "messenger",
  LOGISTICS_ASSISTANT = "logistics_assistant",
  COMMUNITY_MANAGER = "community_manager",
  TRAINER = "trainer",
  EVENT_STAFF = "event_staff",
}
export interface CreateUserConjuntoRelation {
  userId: string; // ✅ coincide con backend
  conjuntoId: string; // ✅ coincide con backend
  role: UserRole;
  isMainResidence?: boolean;
  active?: boolean;
  apartment?: string;
  tower?: string; // ⚠️ faltaba en tu interfaz
  plaque?: string;
  namesuer?: string;
  numberId?: string;
  vehicles?: vehicless[];
}

export interface CreateConjuntoRelation {
  status: number;
  data: CreateUserConjuntoRelation;
}
