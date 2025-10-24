export interface File {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface CreateBedRoomDto {
  name: string;
  beds: number;
}

export interface HollidayInfoResponses {
  id: string;
  iduser: string;
  property: string;
  name: string; // nombre del anuncio
  bedRooms: CreateBedRoomDto[];
  maxGuests: number;
  neigborhood: string;
  city: string;
  country: string;
  address: string;
  tower: string;
  apartment: string;
  cel: string;
  amenities: string[];
  parking: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  eventsAllowed: boolean;
  residentplace: boolean;
  bartroomPrivate: boolean;
  status: boolean;
  roomingin: boolean;
  price: number;
  currency: string;
  cleaningFee: number;
  deposit: number;
  promotion: string;
  ruleshome: string;
  description: string;
  files: File[];
  nameUnit: string;
  unitName: string;
  conjunto_id: string;
  startDate: string;
  endDate: string;
  codigo: string;
  indicative: string;
  anfitrion: string;
  image: string;
  videoUrl: string;
  videos: string[];
}
