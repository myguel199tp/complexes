"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getConjuntoSettings } from "../../services/conjuntoSettingsService";

export const CONJUNTO_SETTINGS_QUERY = "conjunto-settings";

export function useConjuntoSettingsQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [CONJUNTO_SETTINGS_QUERY, conjuntoId],
    queryFn: () => getConjuntoSettings(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
