import { useQuery } from "@tanstack/react-query";
import { ConjuntoBankService } from "../services/bankUnitService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export const useHasBankAccount = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  return useQuery({
    queryKey: ["has-bank-account", conjuntoId],
    queryFn: () => ConjuntoBankService.getAll(conjuntoId),
    enabled: !!conjuntoId,
  });
};
