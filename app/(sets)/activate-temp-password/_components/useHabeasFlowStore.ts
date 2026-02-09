import { create } from "zustand";

interface HabeasFlowState {
  showProteccionDatos: boolean;
  setShowProteccionDatos: (value: boolean) => void;
  completeProteccionDatos: () => void;
}

export const useHabeasFlowStore = create<HabeasFlowState>((set) => ({
  showProteccionDatos: true,

  setShowProteccionDatos: (value) => set({ showProteccionDatos: value }),

  completeProteccionDatos: () => set({ showProteccionDatos: false }),
}));
