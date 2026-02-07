// import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataDemsotrationServices } from "../../services/demostServices";
import { DemonstrationResponse } from "../../services/response/demostrationResponse";
import { CreateDemonstrationRequest } from "../../services/request/demostrationRequest";

const api = new DataDemsotrationServices();

export function useDemostrationMutation() {
  //   const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<DemonstrationResponse, Error, CreateDemonstrationRequest>({
    mutationFn: (data) => api.createDemonstration(data),

    onSuccess: () => {
      showAlert("¡Operacion exitosa!", "success");
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
