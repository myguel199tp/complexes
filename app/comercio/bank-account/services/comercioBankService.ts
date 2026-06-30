import { comercioFetch } from "../../_lib/comercio-api";

export type ComercioAccountType = "SAVINGS" | "CHECKING";

export interface ComercioBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: ComercioAccountType;
  country: string;
  currency: string;
  isPrimary: boolean;
  isActive: boolean;
  isVerified: boolean;
}

export interface CreateComercioBankPayload {
  bankName: string;
  accountNumber: string;
  accountType: ComercioAccountType;
  country: string;
  currency: string;
  otp: string;
  swiftCode?: string;
  iban?: string;
  routingNumber?: string;
  clabe?: string;
}

export function generateBankOtp() {
  return comercioFetch<{ message: string }>(
    "/comercio/bank-account/generate-otp",
    { method: "POST" },
  );
}

export function createBankAccount(data: CreateComercioBankPayload) {
  return comercioFetch<ComercioBankAccount>("/comercio/bank-account", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getBankAccounts() {
  return comercioFetch<ComercioBankAccount[]>("/comercio/bank-account");
}

export function hasBankAccount() {
  return comercioFetch<{ hasBankAccount: boolean }>(
    "/comercio/bank-account/exists",
  );
}

export function setPrimaryBankAccount(id: string) {
  return comercioFetch<ComercioBankAccount>(
    `/comercio/bank-account/${id}/primary`,
    { method: "POST" },
  );
}

export function deactivateBankAccount(id: string) {
  return comercioFetch<ComercioBankAccount>(
    `/comercio/bank-account/${id}/deactivate`,
    { method: "POST" },
  );
}
