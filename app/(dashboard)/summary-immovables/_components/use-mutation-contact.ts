import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { ContactServices } from "../services/contactService";
import {
  ContactResponse,
  ICreateContact,
} from "../services/response/contactResponse";

export function useMutationContact(onSuccess?: () => void) {
  const api = new ContactServices();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ContactResponse, Error, ICreateContact>({
    mutationFn: async (data) => {
      const response = await api.contactServices(data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        /* class-validator devuelve message como array cuando falla el DTO */
        const rawMessage = errorData?.error || errorData?.message;
        const errorMessage = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage;
        throw new Error(
          errorMessage || "Ocurrió un error desconocido al enviar tus datos",
        );
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert(
        "¡Datos enviados! El anunciante se pondrá en contacto contigo.",
        "success",
      );
      onSuccess?.();
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
