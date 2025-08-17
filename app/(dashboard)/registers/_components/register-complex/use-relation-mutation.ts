import { useMutation } from "@tanstack/react-query";
import { DataRegister } from "../../services/authService";
import {
  CreateUserConjuntoRelation,
  CreateConjuntoRelation,
} from "../../services/response/registerRelationResponse";

export function useRelationMutation() {
  const api = new DataRegister();

  return useMutation<CreateConjuntoRelation, Error, CreateUserConjuntoRelation>(
    {
      mutationFn: async (payload) => {
        return await api.registerRelationConjunto(payload);
      },
      onSuccess: (data) => {
        console.log("Conjunto registrado con éxito:", data);
      },
      onError: (error) => {
        console.error("Error al registrar conjunto:", error.message);
      },
    }
  );
}
