import { useMutation } from "@tanstack/react-query";
import { DataRegister } from "../../services/authService";
import { useRegisterStore } from "../store/registerStore";
import { RegisterConjuntoResponse } from "../../services/response/conjuntoResponse";

export function useMutationConjuntoForm() {
  const api = new DataRegister();
  const { showRegistThree, setIdConjunto } = useRegisterStore();

  return useMutation<RegisterConjuntoResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const result = await api.registerConjunto(formData);

      if (result.status === 201) {
        setIdConjunto(String(result.data.id));
        showRegistThree();
      }

      return result;
    },
  });
}
