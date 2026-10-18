"use client";

import React, { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";
import Form from "./form";
import ApproverCard from "./approver-card";
import PettyCashPanel from "./petty-cash-panel";

export default function Bills() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myBills);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={"Agregar gastos"}
        tooltip={"Gastos agregados"}
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
        idicative="Gastos agregados"
      />
      <div className="w-full flex gap-2">
        <div className={showInfo ? "flex-1" : "w-full"}>
          <ApproverCard />
          <div className="mt-2">
            <PettyCashPanel audience="staff" />
          </div>
          <Form />
        </div>

        {showInfo && (
          <div
            className="
              flex flex-col gap-3 p-3 shadow-lg border rounded-lg
              w-full md:w-[220px]
              max-h-[300px] md:max-h-[500px]
              overflow-y-auto scrollbar-hide
              mt-2
            "
          >
            <Text colVariant="on" size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text colVariant="on" size="xs">
              Relaciona los gastos del conjunto o unidad residencial
            </Text>
            <Text colVariant="on" size="xs">
              Si indicas quién aprueba los gastos, cada gasto le llega para que
              lo apruebe o lo rechace antes del pago. Con caja menor asignada,
              los gastos pequeños se reportan ya pagados, sin aprobación.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
