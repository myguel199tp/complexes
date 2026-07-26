import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataProductService } from "../../services/addProduct";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { QUERY_MY_ADD } from "../use-myadd-query";

export function useMutationProductForm() {
  const api = new DataProductService();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await api.products(conjuntoId, formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // El ValidationPipe de Nest devuelve `message` como array.
        const rawMessage = errorData?.message ?? errorData?.error;
        const errorMessage = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage ||
            "Ocurrió un error desconocido al registrar los productos";
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar el catálogo en vez de navegar: el listado se repinta solo
      // y el vendedor puede seguir cargando productos sin recargar.
      queryClient.invalidateQueries({
        queryKey: [QUERY_MY_ADD, conjuntoId],
      });
      showAlert("¡Producto publicado!", "success");
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
