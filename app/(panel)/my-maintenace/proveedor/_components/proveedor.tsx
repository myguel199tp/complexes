"use client";
import React, { useState } from "react";
import Form from "./form";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FaCogs } from "react-icons/fa";

export default function Proveedor() {
  const router = useRouter();
  //  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.areaProveedorResult);
  };
  return (
    <div key={language}>
      <HeaderAction
        title="Agregar proveedor"
        tooltip="Proveedores Agregados"
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
        idicative="Proveedores agregados"
      />

      <Form />
    </div>
  );
}
