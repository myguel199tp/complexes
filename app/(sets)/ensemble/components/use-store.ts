import { create } from "zustand";

interface ConjuntoState {
  conjuntoId: string | null;
  conjuntoName: string | null;
  setConjuntoId: (id: string) => void;
  setConjuntoName: (name: string) => void;
  clearConjuntoId: () => void;
  clearConjuntoName: () => void;
}

export const useConjuntoStore = create<ConjuntoState>((set) => ({
  conjuntoId: null,
  conjuntoName: null,
  setConjuntoId: (id: string) => set({ conjuntoId: id }),
  clearConjuntoId: () => set({ conjuntoId: null }),
  setConjuntoName: (id: string) => set({ conjuntoName: id }),
  clearConjuntoName: () => set({ conjuntoName: null }),
}));
