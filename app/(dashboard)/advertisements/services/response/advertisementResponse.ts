export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface AdvertisementResponses {
  _id: string;
  files: File[];
  iduser: string;
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  phone: string;
}
