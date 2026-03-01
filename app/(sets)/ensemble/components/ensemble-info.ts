import { useQuery } from "@tanstack/react-query";
import { EnsembleResponse } from "../service/response/ensembleResponse";
import { EnsembleService } from "../service/ensembleService";
import { useConjuntoStore } from "./use-store";

export function useEnsembleInfo() {
  const storedUserId = useConjuntoStore((state) => state.userId);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<EnsembleResponse[]>({
    queryKey: ["ensembleInfo"],
    queryFn: () => EnsembleService(storedUserId),
  });

  return {
    data,
    loading: isLoading,
    error,
  };
}
