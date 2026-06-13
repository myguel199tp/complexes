import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  bulkRegisterService,
  BulkRegisterDto,
  BulkRegisterSummary,
} from "../services/bulkRegisterService";

const QUERY_USER_REGISTER = "query_user_register";

export function useBulkRegisterMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<BulkRegisterSummary, Error, BulkRegisterDto>({
    mutationFn: (dto) =>
      bulkRegisterService({ ...dto, conjuntoId: dto.conjuntoId ?? conjuntoId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_USER_REGISTER] });
      showAlert(
        `Registro masivo: ${data.created} creados, ${data.skipped} omitidos, ${data.failed} fallidos`,
        data.failed > 0 ? "error" : "success",
      );
    },
    onError: (error) => {
      showAlert(error.message || "Error en registro masivo", "error");
    },
  });
}
