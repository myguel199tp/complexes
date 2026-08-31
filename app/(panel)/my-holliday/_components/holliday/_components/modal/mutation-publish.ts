import {
  HollidayServices,
  type PublishHollidayPayload,
} from "@/app/(panel)/my-holliday/services/hollidayPublishServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutation } from "@tanstack/react-query";

const service = new HollidayServices();

interface PublishVariables extends PublishHollidayPayload {
  hollidayId: string;
}

export function usePublishHolliday() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: ({ hollidayId, ...payload }: PublishVariables) =>
      service.publishHolliday(conjuntoId, hollidayId, payload),
  });
}
