import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { CitofonieService } from "../../services/citofonieService";

export function useMutationVisit() {
  const api = new CitofonieService();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.registerVisit(formData);

      if (response.status === 201) {
        router.push(route.complexes);
      } else {
        throw new Error("Error en el registro");
      }
    },
  });
}
