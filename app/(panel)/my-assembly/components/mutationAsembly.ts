import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataAsemblyServices } from "../services/myAsemblyService";
import { CreateAssemblyRequest } from "../services/request/assemblyRequest";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationAssembly() {
  const api = new DataAsemblyServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (formData: CreateAssemblyRequest) => {
      return api.addAssembly(conjuntoId, formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        router.push(route.myConvention);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
