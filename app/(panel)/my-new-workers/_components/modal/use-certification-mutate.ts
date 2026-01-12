import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { DataCertificationAllServices } from "../../services/useCertificationService";

export function useMutationCertificationCert() {
  const api = new DataCertificationAllServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.addCert(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        router.push(route.user);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
