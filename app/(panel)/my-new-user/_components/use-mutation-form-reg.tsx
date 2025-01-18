import { useRouter } from "next/navigation";
import { DataRegister } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";

export function useMutationFormReg() {
  const api = new DataRegister();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerUser(formData);
      if (response.status === 201) {
        console.log("Response successful");
        router.push(route.complexes);
      } else {
        throw new Error("Error en el registro");
      }
    },
    onError: (error) => {
      console.error("Error al registrar usuario:", error);
    },
  });
}
