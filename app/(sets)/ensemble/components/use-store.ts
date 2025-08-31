import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface ConjuntoState {
  conjuntoId: string | null;
  conjuntoName: string | null;
  setConjuntoId: (id: string) => void;
  setConjuntoName: (name: string) => void;
  clearConjuntoId: () => void;
  clearConjuntoName: () => void;
}

// Wrapper de localStorage compatible con PersistStorage
const createStorage = (): PersistOptions<
  ConjuntoState,
  ConjuntoState
>["storage"] => {
  return {
    getItem: (name) => {
      const value = localStorage.getItem(name);
      return value ? Promise.resolve(JSON.parse(value)) : Promise.resolve(null);
    },
    setItem: (name, value) => {
      localStorage.setItem(name, JSON.stringify(value));
      return Promise.resolve();
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
      return Promise.resolve();
    },
  };
};

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
      name: "conjunto-storage",
      storage: typeof window !== "undefined" ? createStorage() : undefined,
    }
  )
);
