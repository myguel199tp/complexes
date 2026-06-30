"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  InputField,
  Modal,
  SelectField,
  Table,
  Title,
} from "complexes-next-components";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioAccountType,
  deactivateBankAccount,
  getBankAccounts,
  setPrimaryBankAccount,
} from "./services/comercioBankService";
import OtpStep from "./_components/otpStep";

const accountTypeOptions = [
  { label: "Ahorros", value: "SAVINGS" },
  { label: "Corriente", value: "CHECKING" },
];

const emptyForm = {
  bankName: "",
  accountNumber: "",
  accountType: "SAVINGS" as ComercioAccountType,
  country: "",
  currency: "",
};

export default function ComercioBankAccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const accountsQuery = useQuery({
    queryKey: ["comercio-bank-accounts"],
    queryFn: getBankAccounts,
  });

  const togglePrimaryMutation = useMutation({
    mutationFn: (id: string) => setPrimaryBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comercio-bank-accounts"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateBankAccount(id),
    onSuccess: () => {
      showAlert("Cuenta desactivada", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-bank-accounts"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function openCreateModal() {
    setForm(emptyForm);
    setStep("form");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setStep("form");
    setForm(emptyForm);
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setStep("otp");
  }

  function handleOtpSuccess() {
    showAlert("Cuenta bancaria registrada correctamente", "success");
    queryClient.invalidateQueries({ queryKey: ["comercio-bank-accounts"] });
    closeModal();
  }

  const accounts = accountsQuery.data ?? [];

  const headers = ["Banco", "Cuenta", "Tipo", "Estado", ""];
  const rows = accounts.map((account) => [
    account.bankName,
    account.accountNumber,
    account.accountType === "SAVINGS" ? "Ahorros" : "Corriente",
    <Badge
      key={account.id}
      colVariant={account.isPrimary ? "success" : "default"}
      size="xs"
    >
      {account.isPrimary ? "Principal" : "Activa"}
    </Badge>,
    <div key={`actions-${account.id}`} className="flex gap-2">
      {!account.isPrimary && (
        <Button
          size="xs"
          rounded="md"
          onClick={() => togglePrimaryMutation.mutate(account.id)}
        >
          Hacer principal
        </Button>
      )}
      <Button
        size="xs"
        rounded="md"
        colVariant="danger"
        onClick={() => deactivateMutation.mutate(account.id)}
      >
        Desactivar
      </Button>
    </div>,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
              ← Volver al panel
            </Link>
            <Title
              as="h1"
              size="lg"
              colVariant="on"
              font="semi"
              className="mt-2"
            >
              Cuenta bancaria
            </Title>
          </div>
          <Button colVariant="success" rounded="md" onClick={openCreateModal}>
            + Agregar cuenta
          </Button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {accountsQuery.isLoading ? (
            <p className="text-slate-400 p-4">Cargando cuentas...</p>
          ) : accounts.length === 0 ? (
            <p className="text-slate-400 p-4">
              Aún no tienes cuentas bancarias registradas. Agrega la primera
              para recibir tus pagos.
            </p>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={step === "form" ? "Nueva cuenta bancaria" : "Verificación OTP"}
        className="w-[920px]"
      >
        {step === "form" ? (
          <form onSubmit={handleSubmitForm} className="space-y-4 p-2">
            <InputField
              placeholder="Nombre del banco"
              helpText="Banco"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              required
            />

            <InputField
              placeholder="Número de cuenta"
              helpText="Número de cuenta"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              required
            />

            <SelectField
              options={accountTypeOptions}
              value={form.accountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  accountType: e.target.value as ComercioAccountType,
                })
              }
              helpText="Tipo de cuenta"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            <div className="flex gap-3">
              <InputField
                placeholder="País (ej. CO)"
                helpText="País"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
              <InputField
                placeholder="Moneda (ej. COP)"
                helpText="Moneda"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                required
              />
            </div>

            <Button type="submit" colVariant="success" size="full" rounded="md">
              Continuar
            </Button>
          </form>
        ) : (
          <OtpStep
            formData={form}
            onSuccess={handleOtpSuccess}
            onError={(message) => showAlert(message, "error")}
          />
        )}
      </Modal>
    </div>
  );
}
