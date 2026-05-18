import { useMutation } from "@tanstack/react-query";
import { DataReturnPassword } from "../service/returnPasswordService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export function useReturnMutationForm() {
  const api = new DataReturnPassword();

  const showAlert = useAlertStore((state) => state.showAlert);

  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      return await api.recoverPassword(email);
    },

    onSuccess: () => {
      showAlert(
        "¡Revisa tu correo o WhatsApp e ingresa al enlace que enviamos!",
        "success",
      );

      setTimeout(() => {
        router.push(route.complexes);
      }, 1500);
    },

    onError: (error) => {
      console.error(error);

      showAlert("Ocurrió un error al recuperar la contraseña", "error");
    },
  });
}
