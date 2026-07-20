export interface ContactOwnerResponse {
  id: string;
  inmovableId: string;
  ownerId: string;
  iduser?: string;
  name: string;
  countryCode: string;
  phoneNum: string;
  maill?: string;
  descripton?: string;
  attended: boolean;
  createdAt: string;
}
