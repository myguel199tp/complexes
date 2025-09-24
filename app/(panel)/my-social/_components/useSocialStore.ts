import { create } from "zustand";

interface SocialModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSocialModalStore = create<SocialModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
