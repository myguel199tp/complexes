import { useMutation } from "@tanstack/react-query";
import { DataMysocialServices } from "../../services/mySocialServices";
import type { SocialRequest } from "../../services/request/socialRequest";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useSocialModalStore } from "../useSocialStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationSocial() {
  const api = new DataMysocialServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const { close: closeModal } = useSocialModalStore();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (data: SocialRequest) => {
      return api.registerSocialService(conjuntoId, data);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
        closeModal();
        router.push(route.mysocial);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: (error) => {
      console.error("❌ Error al crear la reserva:", error);
    },
  });
}
