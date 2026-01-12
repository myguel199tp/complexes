import { useMutation } from "@tanstack/react-query";
import { DataMysocialServices } from "../../services/mySocialServices";
import type { SocialRequest } from "../../services/request/socialRequest";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useSocialModalStore } from "../useSocialStore";

export function useMutationSocial() {
  const api = new DataMysocialServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const { close: closeModal } = useSocialModalStore();
  return useMutation({
    mutationFn: async (data: SocialRequest) => {
      return api.registerSocialService(data);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        closeModal();
        router.push(route.myprofile);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: (error) => {
      console.error("❌ Error al crear la reserva:", error);
    },
  });
}
