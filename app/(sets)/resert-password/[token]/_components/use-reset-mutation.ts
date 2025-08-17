// hooks/useResetPasswordMutation.ts
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataResetPassword } from "../service/resertPasswordService";
import { useAlertStore } from "@/app/components/store/useAlertStore";

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export function useResetPasswordMutation() {
  const api = new DataResetPassword();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordInput) => {
      const response = await api.resetPassword(token, newPassword);
      return response;
    },
    onSuccess: () => {
      showAlert("¡Ingresa con tu nueva contraseña!", "success");
      router.push(route.complexes);
    },
  });
}
