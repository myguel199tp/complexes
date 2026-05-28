import { useQuery } from "@tanstack/react-query";
import { UsageServices } from "../services/usage-services";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useUsage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const api = new UsageServices();

  return useQuery({
    queryKey: ["seller-usage", conjuntoId],
    queryFn: () => api.getUsage(conjuntoId),
    enabled: !!conjuntoId,
  });
}
