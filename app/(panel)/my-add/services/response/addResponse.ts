export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface AddResponses {
  id: string;
  files: File[];
  iduser: string;
  nameUnit: string;
  profession: string;
  webPage: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  instagramred?: string;
  facebookred?: string;
  tiktokred?: string;
  youtubered?: string;
  xred?: string;
}
