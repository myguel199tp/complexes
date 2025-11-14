import { create } from "zustand";

interface AlertState {
  idConjunto: string;
  idUSer: string;
  showFirst: boolean;
  showTwo: boolean;
  showThree: boolean;
  quantity: number;
  prices: number;
  nameConjunto: string;
  nitConjunto: string;
  countryConjunto: string;
  cityConjunto: string;
  addressConjunto: string;
  neigBoorConjunto: string;
  plan: string;

  setIdConjunto: (value: string) => void;
  setdUSer: (value: string) => void;
  showRegistFirst: () => void;
  showRegistTwo: () => void;
  showRegistThree: () => void;
  setQuantity: (value: number) => void;
  setPrices: (value: number) => void;
  setNameConjunto: (value: string) => void;
  setNitConjunto: (value: string) => void;
  setCountryConjunto: (value: string) => void;
  setCityConjunto: (value: string) => void;
  setAddressConjunto: (value: string) => void;
  setNeigBoorConjunto: (value: string) => void;
  setPlan: (value: string) => void;
}

export const useRegisterStore = create<AlertState>((set) => ({
  idConjunto: "",
  idUSer: "",
  showFirst: true,
  showTwo: false,
  showThree: false,
  quantity: 0,
  prices: 0,
  nameConjunto: "",
  nitConjunto: "",
  countryConjunto: "",
  cityConjunto: "",
  addressConjunto: "",
  neigBoorConjunto: "",
  plan: "",

  setIdConjunto: (value) => set({ idConjunto: value }),
  setdUSer: (value) => set({ idUSer: value }),
  showRegistFirst: () =>
    set({ showFirst: true, showTwo: false, showThree: false }),
  showRegistTwo: () =>
    set({ showFirst: false, showTwo: true, showThree: false }),
  showRegistThree: () =>
    set({ showFirst: false, showTwo: false, showThree: true }),

  setQuantity: (value) => set({ quantity: value }),
  setPrices: (value) => set({ prices: value }),

  setNameConjunto: (value) => set({ nameConjunto: value }),
  setNitConjunto: (value) => set({ nitConjunto: value }),
  setCountryConjunto: (value) => set({ countryConjunto: value }),
  setCityConjunto: (value) => set({ cityConjunto: value }),
  setAddressConjunto: (value) => set({ addressConjunto: value }),
  setNeigBoorConjunto: (value) => set({ neigBoorConjunto: value }),

  setPlan: (value) => set({ plan: value }),
}));
