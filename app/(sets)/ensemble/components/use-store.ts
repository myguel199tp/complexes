import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConjuntoState {
  conjuntoId: string | null;
  conjuntoName: string | null;
  setConjuntoId: (id: string) => void;
  setConjuntoName: (name: string) => void;
  clearConjuntoId: () => void;
  clearConjuntoName: () => void;
}

export const useConjuntoStore = create<ConjuntoState>()(
  persist(
    (set) => ({
      conjuntoId: null,
      conjuntoName: null,
      setConjuntoId: (id: string) => set({ conjuntoId: id }),
      clearConjuntoId: () => set({ conjuntoId: null }),
      setConjuntoName: (name: string) => set({ conjuntoName: name }),
      clearConjuntoName: () => set({ conjuntoName: null }),
    }),
    {
      name: "conjunto-storage", // clave en localStorage
    }
  )
);
