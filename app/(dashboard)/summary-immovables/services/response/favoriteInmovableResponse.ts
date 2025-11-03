export interface ICreateFavoriteInmovable {
  iduser: string;
  ofert?: string;
  email: string;
  phone: string;
  codigo: string;
  parking?: string;
  neighborhood: string;
  amenitiesResident?: string[];
  amenities?: string[];
  address: string;
  country: string;
  city?: string;
  property?: string;
  price: number;
  room?: string;
  restroom?: string;
  age?: string;
  administration?: string;
  area: number;
  currency: string;
  indicative: string;
  description: string;
  videoUrl?: string;
  videos?: string[];
  files?: string[];
}
