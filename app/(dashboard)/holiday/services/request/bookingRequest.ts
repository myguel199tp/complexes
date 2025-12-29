// Enums
export enum PassengerType {
  MAYOR = "mayor",
  MENOR = "menor",
  BEBE = "bebe",
}

export enum AgeRange {
  INFANT = "0-2",
  CHILD = "3-11",
  TEEN = "12-17",
  MAYOR = "18+",
}

// Interfaz anidada
export interface PassengerInfo {
  type: PassengerType;
  quantity: number;
  ageRange: AgeRange;
}

// Interfaz principal
export interface CreateBookingRequest {
  holidayId?: string;
  email: string; // email del huésped principal
  night: string;
  passengers: PassengerInfo[];
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  totalPrice?: number;
  nameMain: string;
}
