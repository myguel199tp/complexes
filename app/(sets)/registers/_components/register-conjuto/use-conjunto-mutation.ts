import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DataRegister } from "../../services/authService";
import { useRegisterStore } from "../store/registerStore";
import { RegisterConjuntoResponse } from "../../services/response/conjuntoResponse";
import { useAlertStore } from "@/app/components/store/useAlertStore";

interface BackendErrorResponse {
  status?: number;
  message?: string;
  error?: string;
}

export function useMutationConjuntoForm() {
  const api = new DataRegister();
  const { showRegistThree, setIdConjunto } = useRegisterStore();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<
    RegisterConjuntoResponse,
    AxiosError<BackendErrorResponse>,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      const result = await api.registerConjunto(formData);
      return result;
    },

    onSuccess: (result) => {
      if (result.status === 201) {
        setIdConjunto(String(result.data.id));
        showRegistThree();
        showAlert("¡Operación exitosa!", "success");
      } else {
        showAlert(
          result?.data?.message || "Error inesperado al registrar",
          "error"
        );
      }
    },

    onError: (error) => {
      const backendMessage =
        error.response?.data?.error ??
        error.response?.data?.message ??
        error.message ??
        "Ocurrió un error al registrar el conjunto.";

      showAlert(backendMessage, "error");
    },
  });
}
