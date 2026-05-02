export interface FamilyInfo {
  relation?: string;
  nameComplet?: string;
  lastComplet?: string;
  country?: string;
  city?: string;
  numberId?: string;
  dateBorn?: string;
  phones?: string;
  indicative?: string;
}

export interface RegisterSubUser {
  name: string;
  lastName: string;
  phone: string;
  indicative: string;
  numberId: string;
  email: string;
  file?: File | null;
  country: string;
  city: string;
  bornDate: string;
  familyInfo?: FamilyInfo[];
  pet: boolean;
}
