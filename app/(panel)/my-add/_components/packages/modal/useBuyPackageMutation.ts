import { useMutation } from "@tanstack/react-query";
import {
  BuyPackageRequest,
  DataBuyServices,
} from "../../../services/buyPackageService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";

const service = new DataBuyServices();

interface BuyPackageParams {
  data: BuyPackageRequest;
}

export const useBuyPackageMutation = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: ({ data }: BuyPackageParams) =>
      service.buyPackage(conjuntoId, data),
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo comprar el paquete", "error");
    },
  });
};
