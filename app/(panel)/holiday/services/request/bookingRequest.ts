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

export class guestsInfo {
  nameMain: string;
  documentNumber: string;
  email: string;
  indicative: string;
  phone: string;
}

export interface CreateBookingRequest {
  holidayId?: string;
  indicative: string;
  documentNumber: string;
  phone: string;
  email: string;
  night: string;
  passengers: PassengerInfo[];
  guestsInfos: guestsInfo[];
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  nameMain: string;
}
