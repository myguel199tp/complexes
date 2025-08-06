import { useMutation } from "@tanstack/react-query";
import { DataRegister } from "../../services/authService";
import { useRegisterStore } from "../store/registerStore";

export function useMutationConjuntoForm() {
  const api = new DataRegister();
  const { showRegistThree } = useRegisterStore();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerConjunto(formData);
      if (response.status === 201) {
        showRegistThree();
      }
    },
  });
}
