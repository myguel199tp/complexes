import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { NewImmovableServices } from "../services/newImmovableService";
import { PublicationPaymentRequired } from "../services/publicationFeeService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationImmovable() {
  const api = new NewImmovableServices();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.immovableServices(conjuntoId, formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        queryClient.invalidateQueries({
          queryKey: ["sales-publication-quote"],
        });
        router.push(route.mynewimmovable);
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
    onError: (error) => {
      // El 402 no es un error para el residente: el formulario abre el pago.
      if (error instanceof PublicationPaymentRequired) return;

      showAlert(
        error instanceof Error ? error.message : "Error al agregar el inmueble",
        "error",
      );
    },
  });
}
