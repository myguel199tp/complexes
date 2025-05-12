import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataAddServices } from "../services/addservices";

export function useMutationAddForm() {
  const api = new DataAddServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.adds(formData);

      if (response.ok) {
        router.push(route.complexes);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
