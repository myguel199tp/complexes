import { useRouter } from "next/navigation";
import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";

export function useMutationForm() {
  const api = new DataRegister();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUser(formData);
      if (response.status === 201) {
        router.push(route.complexes);
      }
    },
  });
}
