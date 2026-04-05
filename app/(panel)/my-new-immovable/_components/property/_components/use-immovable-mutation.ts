import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { NewImmovableServices } from "../services/newImmovableService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationImmovable() {
  const api = new NewImmovableServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.immovableServices(conjuntoId, formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.mynewimmovable);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
