"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";

import Form from "./form";
import OtpStep from "./bankUnit/otpStep";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useHasBankAccount } from "./useHasBankAccount";
import { Button } from "complexes-next-components";

type BankFormData = {
  bankName: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
};

export default function AllFees() {
  const router = useRouter();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [step, setStep] = useState<"FORM" | "OTP" | "DONE">("FORM");
  const [formData, setFormData] = useState<BankFormData | null>(null);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const { data, isLoading } = useHasBankAccount();

  console.log("data", data);
  useEffect(() => {
    if (!conjuntoId || isLoading || !data) return;

    if (data.length > 0) {
      setStep("DONE"); // ✔ ya existe cuenta
    } else {
      setStep("FORM");
    }
  }, [data, isLoading, conjuntoId]);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myfees);
  };

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const data: BankFormData = {
      bankName: String(form.get("bankName")),
      accountNumber: String(form.get("accountNumber")),
      accountType: form.get("accountType") as "SAVINGS" | "CHECKING",
    };

    setFormData(data);
    setStep("OTP");
  };

  const handleSuccess = () => {
    setFormData(null);
    setStep("DONE"); // ✔ después de crear cuenta
  };

  if (!conjuntoId) {
    return <p className="text-red-500">No hay conjunto seleccionado</p>;
  }

  if (isLoading) {
    return <p className="p-4">Cargando configuración bancaria...</p>;
  }

  return (
    <div
      key={language}
      className="flex flex-col w-full min-h-screen p-4 box-border"
    >
      <HeaderAction
        title="Agrega las cuotas"
        tooltip="Cuotas agregadas"
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative="Cuotas agregadas"
      />

      <div className={showInfo ? "flex-1" : "w-full"}>
        <div className="flex flex-col gap-6">
          {/* 🟢 FORM */}
          {step === "FORM" && (
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-3">
              <input
                name="bankName"
                placeholder="Nombre del banco"
                className="border p-2"
                required
              />

              <input
                name="accountNumber"
                placeholder="Número de cuenta"
                className="border p-2"
                required
              />

              <select name="accountType" className="border p-2" required>
                <option value="SAVINGS">Ahorros</option>
                <option value="CHECKING">Corriente</option>
              </select>

              <Button colVariant="success" size="full">
                Continuar
              </Button>
            </form>
          )}

          {/* 🔐 OTP */}
          {step === "OTP" && formData && (
            <OtpStep
              conjuntoId={conjuntoId}
              formData={formData}
              onSuccess={handleSuccess}
            />
          )}

          {/* 🟡 FINAL */}
          {step === "DONE" && <Form />}
        </div>
      </div>
    </div>
  );
}
