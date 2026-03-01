import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataProductService } from "../../services/addProduct";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationProductForm() {
  const api = new DataProductService();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await api.products(conjuntoId, formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "Ocurrió un error desconocido al registrar los productos";
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.add);
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
