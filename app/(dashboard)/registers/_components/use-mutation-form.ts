import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
// import { RegisterRequest } from "../services/request/register";

export function useMutationForm() {
  const api = new DataRegister();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUser(formData); // Send FormData directly
      if (response.status === 201) {
        console.log("Response successful");
      }
    },
  });
}
