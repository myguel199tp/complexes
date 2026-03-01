import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataExpenseCategoryServices } from "../services/dataExpenseCategoryServices";
import { ExpenseCategoryResponse } from "../services/response/createExpenseCategoryResponse";
import { CreateExpenseCategoryRequest } from "../services/request/createExpenseCategoryRequest";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useEffect } from "react";

const api = new DataExpenseCategoryServices();

export function useCategoryMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  useEffect(() => {}, [conjuntoId]);

  return useMutation<
    ExpenseCategoryResponse,
    Error,
    CreateExpenseCategoryRequest
  >({
    mutationFn: (data) => {
      if (!conjuntoId) {
        console.error("❌ No hay conjuntoId seleccionado");
        throw new Error("Debes seleccionar un conjunto");
      }

      return api.addCategory(conjuntoId, data);
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");

      queryClient.invalidateQueries({
        queryKey: ["query-category"],
      });
    },

    onError: (error) => {
      console.error("❌ Error en la mutación:", error);
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
