export interface CreateDemonstrationRequest {
  fullName: string;
  email: string;
  phone: string;
  indicative: string;
  nameUnit: string;
  quantityUnits: number;
  message?: string;
}
