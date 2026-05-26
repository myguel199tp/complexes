import { useMutation } from "@tanstack/react-query";
import {
  BuyPackageRequest,
  DataBuyServices,
} from "../../../services/buyPackageService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const service = new DataBuyServices();

interface BuyPackageParams {
  data: BuyPackageRequest;
}

export const useBuyPackageMutation = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: ({ data }: BuyPackageParams) =>
      service.buyPackage(conjuntoId, data),
  });
};
