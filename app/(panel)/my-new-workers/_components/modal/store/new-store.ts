import { create } from "zustand";

interface State {
  isSideNewOpen: boolean;
  textValue: string; // 🆕 nuevo string en el estado
  openSideNew: () => void;
  closeSideNew: () => void;
  setTextValue: (value: string) => void; // 🆕 función para actualizar el string
}

export const useUiStore = create<State>((set) => ({
  isSideNewOpen: false,
  textValue: "", // valor inicial del string
  openSideNew: () => set({ isSideNewOpen: true }),
  closeSideNew: () => set({ isSideNewOpen: false }),
  setTextValue: (value) => set({ textValue: value }),
}));
