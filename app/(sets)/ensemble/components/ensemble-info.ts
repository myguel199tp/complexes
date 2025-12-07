import { useQuery } from "@tanstack/react-query";
import { EnsembleResponse } from "../service/response/ensembleResponse";
import { EnsembleService } from "../service/ensembleService";

export function useEnsembleInfo() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<EnsembleResponse[]>({
    queryKey: ["ensembleInfo"],
    queryFn: () => EnsembleService(),
  });

  return {
    data,
    loading: isLoading,
    error,
  };
}
