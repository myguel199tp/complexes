import { create } from "zustand";
import { displayMessage } from "@/app/helpers/backendError";

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
  // Los hooks pasan error.message tal cual; aquí se traducen los centinelas
  // de fetchWithAuth (SESSION_EXPIRED, PLAN_EXPIRED) para no mostrarlos crudos.
  showAlert: (message, type) =>
    set({ message: displayMessage(message), type, show: true }),
  hideAlert: () => set({ message: "", show: false }),
}));
