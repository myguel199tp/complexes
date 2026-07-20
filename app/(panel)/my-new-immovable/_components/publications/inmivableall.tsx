"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Text, Button } from "complexes-next-components";
import Publications from "./publications";
import Contacts from "../contacts/contacts";

export default function InmivableAll() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [tab, setTab] = useState<"publications" | "contacts">("publications");

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.immovable);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Inmuebles registrados"
        tooltip={t("registerinmovable")}
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
        idicative={t("registerinmovable")}
      />
      <div className="flex gap-2 border-b mt-2 px-2">
        <button
          type="button"
          onClick={() => setTab("publications")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            tab === "publications"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Publicaciones
        </button>

        <button
          type="button"
          onClick={() => setTab("contacts")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
            tab === "contacts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Quieren contactarte
        </button>
      </div>

      <div className="w-full flex gap-2">
        {tab === "publications" ? <Publications /> : <Contacts />}

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
            <Text size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text size="xs">
              Si vas a vender o arrendar tu apartamento o tienes algun otro
              domicilio que quieras arrendar o vender
            </Text>

            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>
            <Text size="xs">
              Solo puedes publicar un unmueble si quieres publicar más de uno te
              recomendamos comprar alguno de neustros paquetes
            </Text>

            <div className="flex flex-col gap-4 mt-2">
              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Básico Inmuebles
                </Text>
                <Text size="xs">+10 inmuebes adicionales</Text>
                <Text size="xs" font="semi">
                  $45.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>

              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Pro Inmuebles
                </Text>
                <Text size="xs">+50 inmuebles adicionales</Text>
                <Text size="xs" font="semi">
                  $135.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
