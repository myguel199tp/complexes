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
import Link from "next/link";
import { IoBusinessOutline } from "react-icons/io5";

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

      {/*
        Antes de teclear una empresa a mano vale la pena mirar si ya está en la
        plataforma como aliada: al firmar el contrato el proveedor se crea solo
        y queda enlazado con la alianza, sin doble digitación.
      */}
      <Link
        href="/my-b2b"
        className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.07] p-4 transition hover:bg-cyan-500/[0.12]"
      >
        <IoBusinessOutline size={24} className="shrink-0 text-cyan-600" />
        <span className="flex flex-col">
          <span className="font-semibold text-white">
            Buscar entre los aliados B2B
          </span>
          <span className="text-xs text-gray-300">
            Si la empresa ya está en la plataforma, contrátala desde allí y se
            agrega sola a tus proveedores
          </span>
        </span>
      </Link>

      <Form />
    </div>
  );
}
