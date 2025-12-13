export interface FamilyInfo {
  relation?: string;
  nameComplet?: string;
  numberId?: string;
  email?: string;
  dateBorn?: string;
  phones?: string;
  indicative?: string;
  indicatine?: string;
  file?: File | null;
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
