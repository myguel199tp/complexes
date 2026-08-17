"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { registerFamilyService } from "../services/familyService";
import { RegisterFamilyRequest } from "../services/request/registerFamilyRequest";
import { RegisterFamilyResponse } from "../services/response/familyResponse";
import { QUERY_FAMILY } from "./use-family-query";

const QUERY_INFO = "query_info";

export function useRegisterFamilyMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<RegisterFamilyResponse, Error, RegisterFamilyRequest>({
    mutationFn: (dto) => registerFamilyService(String(conjuntoId), dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_FAMILY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_INFO] });

      // El alta es parcial por diseño: un correo repetido o ya vinculado no
      // tumba a los demás, así que hay que decir cuáles no entraron.
      const failed = data.results.filter(
        (r) => r.status === "error" || r.status === "already_related",
      );

      if (failed.length > 0) {
        showAlert(
          `${data.message}. Sin registrar: ${failed
            .map((f) => `${f.email} (${f.message ?? "error"})`)
            .join("; ")}`,
          "info",
        );
        return;
      }

      showAlert(
        `${data.message}. Le enviamos el correo de activación a cada uno.`,
        "success",
      );
    },
    onError: (error) => {
      showAlert(error.message || "Error al registrar el familiar", "error");
    },
  });
}
