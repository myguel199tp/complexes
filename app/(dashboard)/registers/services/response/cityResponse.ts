export interface State {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  state: State;
}

export interface Country {
  ids: number;
  indicative: string;
  lat: string;
  lng: string;
  postal: string;
  currency: string;
  country: string;
  city: City[];
}
