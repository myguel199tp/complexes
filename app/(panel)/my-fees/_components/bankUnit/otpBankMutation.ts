import { useMutation } from "@tanstack/react-query";
import { ConjuntoBankService } from "../../services/bankUnitService";

export interface CreateConjuntoBankPayload {
  bankName: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
  otp: string;
  country: string;
  currency: string;
}

export const useGenerateOtp = (conjuntoId: string) => {
  return useMutation({
    mutationFn: () => ConjuntoBankService.generateOtp(conjuntoId),
  });
};

export const useVerifyOtpAndCreate = (conjuntoId: string) => {
  return useMutation({
    mutationFn: (data: CreateConjuntoBankPayload) =>
      ConjuntoBankService.create(data, conjuntoId),
  });
};
