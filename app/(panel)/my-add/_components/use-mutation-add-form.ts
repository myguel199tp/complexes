import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataAddServices } from "../services/addservices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationAddForm() {
  const router = useRouter();
  const api = new DataAddServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: (formData: FormData) => api.adds(conjuntoId, formData),

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.add);
    },

    onError: (error: Error) => {
      showAlert(error.message, "error");
    },
  });
}
