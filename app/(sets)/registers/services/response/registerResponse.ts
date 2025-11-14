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

export interface RegisterResult {
  id: string;
  namesuer: string | null;
  tower: string | null;
  apartment: string | null;
  plaque: string | null;
  numberId: string | null;
  role: string;
  isMainResidence: boolean;
  active: boolean;
  createdAt: string;
  vehicles: vehicless[]; // o define un tipo específico si lo tienes
}

export interface RegisterResponse {
  status: number;
  data: RegisterResult;
}
