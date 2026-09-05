import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConjuntoBankService } from "../../services/bankUnitService";

export interface CreateConjuntoBankPayload {
  bankName: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
  otp: string;
  country: string;
  currency: string;
}

/** Clave compartida con `useHasBankAccount`, que es quien lista las cuentas. */
const bankAccountsKey = (conjuntoId: string) => [
  "has-bank-account",
  conjuntoId,
];

export const useGenerateOtp = (conjuntoId: string) => {
  return useMutation({
    mutationFn: () => ConjuntoBankService.generateOtp(conjuntoId),
  });
};

export const useVerifyOtpAndCreate = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConjuntoBankPayload) =>
      ConjuntoBankService.create(data, conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountsKey(conjuntoId) });
    },
  });
};

export const useSetPrimaryAccount = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ConjuntoBankService.setPrimary(id, conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountsKey(conjuntoId) });
    },
  });
};

export const useDeactivateAccount = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ConjuntoBankService.deactivate(id, conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountsKey(conjuntoId) });
    },
  });
};
