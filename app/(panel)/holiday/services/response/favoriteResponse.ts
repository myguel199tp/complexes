interface BedRoomRaw {
  name: string;
  beds: number;
}
export interface ICreateFavorite {
  iduser: string;
  property: string;
  name: string;
  anfitrion?: string;
  bedRooms: BedRoomRaw[];
  maxGuests: number;
  neigborhood?: string;
  city: string;
  country: string;
  address: string;
  codigo: string;
  tower?: string;
  apartment?: string;
  amenities?: string[];
  parking?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  eventsAllowed?: boolean;
  residentplace?: boolean;
  bartroomPrivate?: boolean;
  status?: boolean;
  roomingin?: boolean;
  price: number;
  currency?: string;
  cleaningFee?: number;
  deposit?: number;
  promotion?: string;
  ruleshome: string;
  description: string;
  files?: string[];
  nameUnit: string;
  unitName?: string;
  image?: string;
  videoUrl?: string;
  videos?: string[];
}
