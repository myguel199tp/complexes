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
      const response = await api.recoverPassword(email);

      if (response.status === 200) {
        showAlert(
          "¡Revisa tu correo  e ingresa al enlace que enviamos!",
          "success"
        );
        router.push(route.complexes);
      }
    },
  });
}
