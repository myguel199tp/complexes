import { HollidayServices } from "@/app/(panel)/my-holliday/services/hollidayPublishServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutation } from "@tanstack/react-query";

const service = new HollidayServices();

export function usePublishHolliday() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (hollidayId: string) =>
      service.publishHolliday(conjuntoId, hollidayId),
  });
}
