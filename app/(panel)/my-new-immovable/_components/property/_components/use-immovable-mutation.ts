import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { NewImmovableServices } from "../services/newImmovableService";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationImmovable() {
  const api = new NewImmovableServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.immovableServices(formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        router.push(route.immovables);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
