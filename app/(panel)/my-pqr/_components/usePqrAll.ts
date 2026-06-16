import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { AllPqrService } from "../services/pqrAllServices";
import { PqrResponse } from "../services/response/pqrResponse";

export default function usePqrAll() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const {
    data = [],
    error,
    isLoading,
    refetch,
  } = useQuery<PqrResponse[], Error>({
    queryKey: ["pqr-all", conjuntoId],
    queryFn: async () => {
      if (!conjuntoId) throw new Error("No hay conjuntoId");
      return await AllPqrService(conjuntoId);
    },
    enabled: !!conjuntoId,
  });

  return {
    data,
    error: error ? error.message : null,
    isLoading,
    refetch,
    conjuntoId,
    BASE_URL,
  };
}
