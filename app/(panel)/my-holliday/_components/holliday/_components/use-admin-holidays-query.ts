"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { adminByConjuntoService } from "../../../services/adminByConjuntoService";
import { AdminByConjuntoResponse } from "../../../services/response/adminByConjuntoResponse";

export function useAdminHolidaysQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<AdminByConjuntoResponse[]>({
    queryKey: ["admin-holidays", conjuntoId],
    queryFn: () => adminByConjuntoService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
