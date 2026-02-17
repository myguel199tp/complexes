"use client";
import React, { useState } from "react";
import Form from "./form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Button, Text } from "complexes-next-components";
import { PackageType } from "../../my-news/_components/news";
import PackageModal from "../../my-news/_components/modal/package";
import { usePackageQuery } from "./query-foro";

export default function Foro() {
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
    router.push(route.foro);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={t("agregarForo")}
        tooltip={t("foroAgregado")}
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
            <FaCogs color="white" size={34} />
          </div>
        }
      />
      <div className="w-full flex gap-2">
        {/* FORM */}
        <div className={showInfo ? "flex-1" : "w-full"}>
          <Form />
        </div>

        {showInfo && (
          <div className="flex flex-col gap-3 p-3 shadow-lg border rounded-lg w-full md:w-[220px] max-h-[500px] overflow-y-auto mt-2">
            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>

            <div className="flex flex-col gap-4 mt-2">
              {data?.map((ele: PackageType) => (
                <div key={ele.id} className="border rounded-lg p-4 shadow-sm">
                  <Text size="xs" font="bold">
                    {ele.name}
                  </Text>
                  <Text size="xs">+{ele.maxItems} foros adicionales</Text>
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
      </div>
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
