export interface ICreateContact {
  inmovableId: string;
  ownerId: string;
  iduser?: string;
  name: string;
  countryCode?: string;
  phoneNum: string;
  maill?: string;
  descripton?: string;
}

export interface ContactResponse extends ICreateContact {
  id: string;
  attended: boolean;
  createdAt: string;
}
