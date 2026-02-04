import { useQuery } from "@tanstack/react-query";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataLocalsServices } from "../../services/localsServices";

const api = new DataLocalsServices();

export function useLocalsQuery() {
  const payload = getTokenPayload();
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const QUERY_LOCALS = "query_locals";

  const query = useQuery({
    queryKey: [QUERY_LOCALS, userId, conjuntoId],
    queryFn: () => api.allLocals(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    userId,
    conjuntoId,
  };
}
