// hooks/usePublishHolliday.ts
import { HollidayServices } from "@/app/(panel)/my-holliday/services/hollidayPublishServices";
import { useMutation } from "@tanstack/react-query";

const service = new HollidayServices();

export function usePublishHolliday() {
  return useMutation({
    mutationFn: (hollidayId: string) => service.publishHolliday(hollidayId),
  });
}
