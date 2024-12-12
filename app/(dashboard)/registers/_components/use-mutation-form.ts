import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";

export function useMutationForm() {
  const api = new DataRegister();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUser(formData);
      if (response.status === 201) {
        console.log("Response successful");
      }
    },
  });
}
