import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

interface ConjuntoState {
  apartment: string | null;
  nameUser: string | null;
  lastName: string | null;
  numberId: string | null;
  tower: string | null;
  conjuntoImage: string | null;
  conjuntoId: string | null;
  conjuntoName: string | null;

  setConjuntoId: (id: string) => void;
  setConjuntoName: (name: string) => void;
  setConjuntoApartment: (apartment: string) => void;
  setConjuntoTower: (tower: string) => void;
  setConjuntoImage: (conjuntoImage: string) => void;
  setUserName: (nameUser: string) => void;
  setUserLastName: (lastName: string) => void;
  setUserNumberId: (numberId: string) => void;

  clearConjuntoId: () => void;
  clearConjuntoName: () => void;
  clearConjuntoApartment: () => void;
  clearConjuntoTower: () => void;
  clearConjuntoImage: () => void;

  clearUserName: () => void;
  clearUserLastName: () => void;
  clearUserNumnerId: () => void;
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
      apartment: null,
      tower: null,
      conjuntoImage: null,
      nameUser: null,
      lastName: null,
      numberId: null,
      setConjuntoId: (id: string) => set({ conjuntoId: id }),
      clearConjuntoId: () => set({ conjuntoId: null }),

      setConjuntoName: (name: string) => set({ conjuntoName: name }),
      clearConjuntoName: () => set({ conjuntoName: null }),

      setConjuntoApartment: (apartment: string) => set({ apartment }),
      clearConjuntoApartment: () => set({ apartment: null }),

      setConjuntoTower: (tower: string) => set({ tower }),
      clearConjuntoTower: () => set({ tower: null }),

      setConjuntoImage: (conjuntoImage: string) => set({ conjuntoImage }),
      clearConjuntoImage: () => set({ conjuntoImage: null }),

      setUserName: (nameUser: string) => set({ nameUser }),
      clearUserName: () => set({ nameUser: null }),

      setUserLastName: (lastName: string) => set({ lastName }),
      clearUserLastName: () => set({ lastName: null }),

      setUserNumberId: (numberId: string) => set({ numberId }),
      clearUserNumnerId: () => set({ numberId: null }),
    }),
    {
      name: "conjunto-storage",
      storage: typeof window !== "undefined" ? createStorage() : undefined,
    }
  )
);
