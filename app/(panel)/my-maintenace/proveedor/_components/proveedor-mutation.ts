// import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataProviderServices } from "../../services/providerServices";
import { ProviderResponse } from "../../services/response/providerResponse";
import { CreateProviderRequest } from "../../services/request/createproviderRequest";

const api = new DataProviderServices();

export function useProviderMutation() {
  //   const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ProviderResponse, Error, CreateProviderRequest>({
    mutationFn: (data) => api.addProvider(data),

    onSuccess: () => {
      showAlert("¡Operacion exitosa!", "success");

      // 🔄 Refrescar listado de áreas comunes
      queryClient.invalidateQueries({
        queryKey: ["query-providers"],
      });

      // 🔀 Redirección si aplica
      // router.push("/dashboard/common-areas");
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
