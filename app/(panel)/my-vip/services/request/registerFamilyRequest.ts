export interface FamilyMemberRequest {
  name: string;
  lastName: string;
  email: string;
  numberId: string;
  phone?: string;
  indicative?: string;
  bornDate?: string;
  relation?: string;
  country?: string;
  city?: string;
}

export interface RegisterFamilyRequest {
  members: FamilyMemberRequest[];
}
