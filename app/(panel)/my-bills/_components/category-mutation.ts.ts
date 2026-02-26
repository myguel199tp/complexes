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

  // 🔎 Ver cuando cambia el conjuntoId
  useEffect(() => {
    console.log("📌 conjuntoId desde store:", conjuntoId);
  }, [conjuntoId]);

  return useMutation<
    ExpenseCategoryResponse,
    Error,
    CreateExpenseCategoryRequest
  >({
    mutationFn: (data) => {
      console.log("🚀 Ejecutando mutation...");
      console.log("📌 conjuntoId en mutationFn:", conjuntoId);
      console.log("📦 Data enviada:", data);

      if (!conjuntoId) {
        console.error("❌ No hay conjuntoId seleccionado");
        throw new Error("Debes seleccionar un conjunto");
      }

      return api.addCategory(conjuntoId, data);
    },

    onSuccess: () => {
      console.log("✅ Categoría creada correctamente");
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
