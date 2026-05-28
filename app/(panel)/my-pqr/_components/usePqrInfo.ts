import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { t } from "i18next";

import { AllPqrInfoService } from "../services/pqrinfoServices";
import { PqrResponse } from "../services/response/pqrResponse";

export default function usePqrInfo() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const {
    data = [],
    error,
    isLoading,
    refetch,
  } = useQuery<PqrResponse[], Error>({
    queryKey: ["pqr-info", conjuntoId],
    queryFn: async () => {
      if (!conjuntoId) {
        throw new Error("No hay conjuntoId");
      }

      return await AllPqrInfoService(conjuntoId);
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
    t,
  };
}
