// stores/useAlertStore.ts
import { create } from "zustand";

interface AlertState {
  message: string;
  type: "success" | "error" | "info";
  show: boolean;
  showAlert: (message: string, type: "success" | "error" | "info") => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  message: "",
  type: "success",
  show: false,
  showAlert: (message, type) => set({ message, type, show: true }),
  hideAlert: () => set({ message: "", show: false }),
}));
