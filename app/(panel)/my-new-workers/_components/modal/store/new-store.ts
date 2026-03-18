import { create } from "zustand";

interface State {
  isSideNewOpen: boolean;
  textValue: string; 
  openSideNew: () => void;
  closeSideNew: () => void;
  setTextValue: (value: string) => void; 
}

export const useUiStore = create<State>((set) => ({
  isSideNewOpen: false,
  textValue: "", 
  openSideNew: () => set({ isSideNewOpen: true }),
  closeSideNew: () => set({ isSideNewOpen: false }),
  setTextValue: (value) => set({ textValue: value }),
}));
