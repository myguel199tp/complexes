"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";

import Form from "./form";
import BankAccountForm from "./bankUnit/bank-account-form";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useHasBankAccount } from "./useHasBankAccount";
import { Text } from "complexes-next-components";

export default function AllFees() {
  const router = useRouter();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const { data, isLoading } = useHasBankAccount();

  // Con al menos una cuenta el módulo queda operativo; las cuentas adicionales
  // se agregan desde el desplegable "Cuenta de banco" de la tabla.
  const hasAccounts = Array.isArray(data) && data.length > 0;

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myfees);
  };

  if (!conjuntoId) {
    return (
      <Text size="sm" colVariant="danger">
        No hay conjunto seleccionado
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Text colVariant="on" size="sm" className="p-4">
        Cargando configuración bancaria...
      </Text>
    );
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
          {hasAccounts ? (
            <Form />
          ) : (
            <BankAccountForm
              conjuntoId={conjuntoId}
              onSuccess={() => {
                /* La lista se invalida en la mutación: el render cambia solo. */
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
