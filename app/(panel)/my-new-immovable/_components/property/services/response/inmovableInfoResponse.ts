export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface InmovableinfoResponses {
  id: string;
  files: File[];
  iduser: string;
  ofert: string;
  email: string;
  phone: string;
  parking: string;
  neighborhood: string;
  address: string;
  country: string;
  city: string;
  property: string;
  stratum: string;
  price: string;
  room: string;
  restroom: string;
  age: string;
  administration: string;
  area: string;
  description: string;
}
