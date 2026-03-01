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

export interface PassengerInfo {
  type?: PassengerType;
  quantity?: number;
  ageRange?: AgeRange;
}

export interface CreateBookingRequest {
  holidayId?: string;
  email: string;
  night: string;
  passengers: PassengerInfo[];
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  nameMain: string;
}
