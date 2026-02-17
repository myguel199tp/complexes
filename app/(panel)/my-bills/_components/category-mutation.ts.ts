// import { useRouter } from "next/navigation";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataExpenseCategoryServices } from "../services/dataExpenseCategoryServices";
import { ExpenseCategoryResponse } from "../services/response/createExpenseCategoryResponse";
import { CreateExpenseCategoryRequest } from "../services/request/createExpenseCategoryRequest";

const api = new DataExpenseCategoryServices();

export function useCategoryMutation() {
  //   const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<
    ExpenseCategoryResponse,
    Error,
    CreateExpenseCategoryRequest
  >({
    mutationFn: (data) => api.addCategory(data),

    onSuccess: () => {
      showAlert("¡Operacion exitosa!", "success");

      // 🔄 Refrescar listado de áreas comunes
      queryClient.invalidateQueries({
        queryKey: ["query-category"],
      });

      // 🔀 Redirección si aplica
      // router.push("/dashboard/common-areas");
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
