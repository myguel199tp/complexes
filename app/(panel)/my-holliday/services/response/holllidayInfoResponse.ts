export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface HollidayInfoResponses {
  _id: string;
  neigborhood: string;
  property: string;
  city: string;
  country: string;
  address: string;
  name: string;
  price: string;
  maxGuests: number;
  parking: string;
  petsAllowed: boolean;
  ruleshome: string;
  description: string;
  files: File[];
  promotion?: string;
  nameUnit: string;
  apartment?: string;
  cel: string;
  startDate: string;
  endDate: string;
}
