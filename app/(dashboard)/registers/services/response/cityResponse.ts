export interface CityResposne {
  id: string;
  ids: number;
  indicative: string;
  currency: string;
  country: string;
  city: {
    id: number;
    name: string;
  }[];
}
