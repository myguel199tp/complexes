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

/**
 * Elegir la cuenta que recibe los pagos en línea, o apagarlos (`id` null).
 * Cambia lo que ven los propietarios, así que también se refresca su estado.
 */
export const useOnlinePaymentsAccount = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | null) =>
      id
        ? ConjuntoBankService.enableOnlinePayments(id, conjuntoId)
        : ConjuntoBankService.disableOnlinePayments(conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountsKey(conjuntoId) });
      queryClient.invalidateQueries({
        queryKey: ["online-payment-status", conjuntoId],
      });
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
