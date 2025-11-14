import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { RemoveUserService } from "../services/userRemoveService";

export function useMutationRemoveUser(conjuntoId: string) {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (userId: string) => {
      // 👇 Llamamos el servicio con userId + conjuntoId
      return RemoveUserService(userId, conjuntoId);
    },
    onSuccess: () => {
      showAlert("¡Usuario eliminado exitosamente!", "success");
    },
    onError: () => {
      showAlert("¡Error al eliminar el usuario!", "error");
    },
  });
}
