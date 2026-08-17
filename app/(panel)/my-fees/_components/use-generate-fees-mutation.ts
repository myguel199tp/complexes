import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  FeePaymentsService,
  GenerateFeesResponse,
} from "../services/feePaymentsService";

export function useGenerateFeesMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<GenerateFeesResponse, Error, string>(
    {
      mutationFn: (configId: string) =>
        FeePaymentsService.generateFees(configId, conjuntoId),

      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["admin-fee-payments"],
        });

        /**
         * Antes siempre se avisaba "generadas correctamente", aunque a media
         * copropiedad no le hubiera quedado ninguna cuota: los errores por
         * unidad se tragaban en el backend y nadie se enteraba.
         */
        const parts = [
          `Se generaron ${data.generatedFees} cuotas`,
          ...(data.units ? [`para ${data.units} unidad(es)`] : []),
        ];

        if (data.skippedFees) {
          parts.push(`${data.skippedFees} ya existían y no se duplicaron`);
        }

        if (data.errors?.length) {
          const detail = data.errors
            .slice(0, 3)
            .map(
              (e) => `${e.apartment ?? "unidad sin identificar"}: ${e.reason}`,
            )
            .join("; ");

          showAlert(
            `${parts.join(". ")}. ${data.errors.length} unidad(es) sin generar — ${detail}`,
            "error",
          );
          return;
        }

        /**
         * Avisos que no impiden generar pero cambian el resultado: sobre todo
         * el conjunto que dejó todos los coeficientes en 1 y escribió el
         * presupuesto anual en "monto base", que reparte mal sin enterarse.
         */
        if (data.warnings?.length) {
          showAlert(`${parts.join(". ")}. ${data.warnings.join(" ")}`, "info");
          return;
        }

        showAlert(`${parts.join(". ")}.`, "success");
      },

      onError: (error) => {
        showAlert(error.message || "Error al generar cuotas", "error");
      },
    },
  );
}
