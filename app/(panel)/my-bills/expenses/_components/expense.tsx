"use client";
import React, { useState } from "react";
import Tables from "./table";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { B2bAdSlot } from "@/app/components/b2b-ads/b2b-ad-slot";

export default function Expense() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.expense);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Gastos Agregados"
        tooltip="Agregar gastos"
        onClick={handleBack}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        idicative="Gastos Agregados"
      />

      <Tables />

      {/* Destacado B2B al pie de los gastos: es donde se ve cuánto se paga en
          aseo o vigilancia. En platino el servidor no devuelve nada. */}
      <B2bAdSlot slot="expenses" className="mt-6" />
    </div>
  );
}
