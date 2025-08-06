import { useMutation } from "@tanstack/react-query";
import { DataMysocialServices } from "../../services/mySocialServices";
import type { SocialRequest } from "../../services/request/socialRequest";

export function useMutationSocial() {
  const api = new DataMysocialServices();

  return useMutation({
    mutationFn: async (data: SocialRequest) => {
      const response = await api.registerSocialService(data);
      return response;
    },
    onSuccess: (response) => {
      if (response.status === 201) {
        window.location.reload(); // recarga la página
        // o puedes usar un refetch si solo necesitas actualizar datos
      }
    },
    onError: (error) => {
      console.error("❌ Error al crear la reserva:", error);
    },
  });
}
