"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { taskService } from "../services/myTaskcreateService";

export function useMyTasksQuery(date?: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["tasks-mine", conjuntoId, date],
    queryFn: () => taskService.listMyTasks(String(conjuntoId), date),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
