"use client";

import React, { useState } from "react";
import Tables from "./table";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { Button, Text } from "complexes-next-components";
import { IoMdCloseCircle } from "react-icons/io";
import { usePackageQuery } from "./query-new-package";
import { PackageType } from "./news";
import PackageModal from "./modal/package";

export default function InfoNews() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { data } = usePackageQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );
  const handleBack = () => {
    setLoading(true);
    router.push(route.news);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={t("noticiasAgregadas")}
        tooltip={t("mynoticia")}
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
        idicative={t("mynoticia")}
      />
      <Tables />

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
