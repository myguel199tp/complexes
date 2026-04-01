"use client";

import React, { useState } from "react";
import Form from "./form";
import { CiViewTable } from "react-icons/ci";
import { ImSpinner9 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { Text, Button } from "complexes-next-components";
import PackageModal from "./modal/package";
import { usePackageQuery } from "./query-new-package";
import { IoMdCloseCircle } from "react-icons/io";

export interface PackageType {
  id: string;
  name: string;
  module: string;
  maxItems: number;
  canHighlight: boolean;
  prioritySearch: boolean;
  price: number;
  durationDays: number;
}

export default function News() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );

  const { data } = usePackageQuery();

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.mynews);
  };

  return (
    <div key={language} className="relative">
      <HeaderAction
        title={t("mynoticia")}
        tooltip={t("noticiasAgregadas")}
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
        idicative={t("noticiasAgregadas")}
      />

      <div className="w-full">
        <Form />
      </div>

      {showInfo && (
        <div
          className="
          absolute right-0 top-16
          z-50
          flex flex-col gap-3 p-3
          shadow-xl border rounded-lg
          w-full md:w-[260px]
          max-h-[500px] overflow-y-auto
          bg-gray-200
        "
        >
          <div className="w-full flex justify-between">
            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>
            <IoMdCloseCircle
              className="cursor-pointer"
              color="red"
              onClick={() => setShowInfo((prev) => !prev)}
            />
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {data?.map((ele: PackageType) => (
              <div
                key={ele.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <Text size="xs" font="bold">
                  {ele.name}
                </Text>

                <Text size="xs">+{ele.maxItems} noticias adicionales</Text>

                <Text size="xs" font="semi">
                  ${ele.price} COP
                </Text>

                <Text size="xs" font="semi">
                  {ele.durationDays} días
                </Text>

                <Button
                  size="xs"
                  className="mt-3 w-full"
                  onClick={() => {
                    setSelectedPackage(ele);
                    setIsModalOpen(true);
                  }}
                >
                  Comprar paquete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPackage && (
        <PackageModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPackage(null);
          }}
          name={selectedPackage.name}
          module={selectedPackage.module}
          maxItems={selectedPackage.maxItems}
          canHighlight={selectedPackage.canHighlight}
          prioritySearch={selectedPackage.prioritySearch}
          price={selectedPackage.price}
          durationDays={selectedPackage.durationDays}
        />
      )}
    </div>
  );
}
