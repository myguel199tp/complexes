import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { NewImmovableServices } from "../services/newImmovableService";

export function useMutationImmovable() {
  const api = new NewImmovableServices();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.immovableServices(formData);

      if (response.ok) {
        router.push(route.complexes);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
