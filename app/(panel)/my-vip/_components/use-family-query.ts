"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { familyMembersService } from "../services/familyService";

export const QUERY_FAMILY = "query_family";

export function useFamilyQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const role = useConjuntoStore((state) => state.role);

  const query = useQuery({
    queryKey: [QUERY_FAMILY, conjuntoId],
    queryFn: () => familyMembersService(String(conjuntoId)),
    // Solo el propietario tiene cupo de familiares; para los demás roles el
    // endpoint responde 403 y no vale la pena pedirlo.
    enabled: !!conjuntoId && role === "owner",
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    conjuntoId,
  };
}
