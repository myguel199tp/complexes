import React, { useState } from "react";
import { Avatar, Buton, Button, Text } from "complexes-next-components";
import ModalVipPay from "./modal/modalVipPay";
import { useInfoQuery } from "./use-info-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { FamilyInfo } from "../../my-new-user/services/request/register";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { ImSpinner9 } from "react-icons/im";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import MessageNotConnect from "@/app/components/messageNotInfo";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openReferrals, setOpenReferrals] = useState(false);
  const userRolName = useConjuntoStore((state) => state.role);
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const router = useRouter();

  const { data = [], isLoading, error } = useInfoQuery();
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  if (error) return <MessageNotConnect />;

  if (!data || data?.length === 0) return null;

  if (!datacountry || !countryOptions || countryOptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div key={language} className="space-y-10">
      {data?.map((elem) => {
        /* 🔥 NORMALIZAMOS COUNTRY */
        const effectiveUserCountry =
          elem?.user?.country ?? elem?.conjunto?.country;

        const countryUser =
          countryOptions.find((c) => c.value === String(effectiveUserCountry))
            ?.label || effectiveUserCountry;

        const cityUser =
          datacountry
            ?.find((c) => String(c.ids) === String(effectiveUserCountry))
            ?.city?.find((c) => String(c.id) === String(elem?.user?.city))
            ?.name || elem?.user?.city;

        const countryUnit =
          countryOptions.find(
            (c) => c.value === String(elem?.conjunto?.country),
          )?.label || elem?.conjunto?.country;

        const cityUnit =
          datacountry
            ?.find((c) => String(c.ids) === String(elem?.conjunto?.country))
            ?.city?.find((c) => String(c.id) === String(elem?.conjunto?.city))
            ?.name || elem?.conjunto?.city;

        let familyInfo: FamilyInfo[] = [];
        if (typeof elem?.user?.familyInfo === "string") {
          try {
            familyInfo = JSON.parse(elem.user.familyInfo);
          } catch {
            familyInfo = [];
          }
        } else if (Array.isArray(elem?.user?.familyInfo)) {
          familyInfo = elem.user.familyInfo;
        }

        const userFile =
          elem?.user?.file && typeof elem.user.file === "string"
            ? elem.user.file.replace(/^.*[\\/]/, "")
            : "default-avatar.png";

        const conjuntoFile =
          elem?.conjunto?.file && typeof elem.conjunto.file === "string"
            ? elem.conjunto.file.replace(/^.*[\\/]/, "")
            : "default-complex.png";

        return (
          <div key={elem.id} className="space-y-10">
            {/* REFERRALS */}
            <div className="rounded-xl border bg-gradient-to-r from-cyan-50 mt-4 to-blue-50 overflow-hidden">
              <button
                onClick={() => setOpenReferrals(!openReferrals)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div>
                  <Text font="bold" size="lg">
                    🎉 Programa de Referidos
                  </Text>
                  <Text size="sm" className="text-gray-600 mt-1 max-w-xl">
                    Invita a otros residentes o administradores y obtén
                    beneficios exclusivos.
                  </Text>
                </div>
                <span className="text-xl">{openReferrals ? "▲" : "▼"}</span>
              </button>

              {openReferrals && (
                <div className="px-6 pb-6">
                  <section className="flex justify-between mt-6">
                    <Buton
                      colVariant="primary"
                      borderWidth="none"
                      rounded="md"
                      size="lg"
                      onClick={() => router.push(route.myreferal)}
                    >
                      Invitar ahora
                    </Buton>
                  </section>
                </div>
              )}
            </div>

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PERSONAL */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar
                    src={`${BASE_URL}/uploads/${userFile}`}
                    alt="avatar usuario"
                    size="xl"
                    border="none"
                    shape="rounded"
                  />
                  <div>
                    <Text font="bold">
                      {elem.user.name} {elem.user.lastName}
                    </Text>
                    <Text size="sm" className="text-gray-500">
                      {elem.user.email}
                    </Text>
                  </div>
                </div>

                <Text size="xs" className="text-gray-500">
                  País
                </Text>
                <Text size="xs" font="semi">
                  {countryUser}
                </Text>

                <Text size="xs" className="text-gray-500 mt-2">
                  Ciudad
                </Text>
                <Text size="xs" font="semi">
                  {cityUser}
                </Text>
              </div>

              {/* FAMILIA */}
              {userRolName === "owner" && (
                <div className="bg-white border rounded-xl p-6">
                  <Text font="bold">{t("familair")}</Text>

                  {familyInfo.length === 0 ? (
                    <Text size="sm" className="text-gray-500 mt-2">
                      No hay información familiar
                    </Text>
                  ) : (
                    familyInfo.map((fam) => (
                      <div key={fam.email} className="mt-3 border-t pt-2">
                        <Text font="semi">{fam.nameComplet}</Text>
                        <Text size="sm" className="text-gray-500">
                          {fam.relation}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PAGOS */}
              {userRolName === "owner" && (
                <div className="bg-white border rounded-xl p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Text font="bold">Pagos</Text>
                    <Button
                      colVariant="warning"
                      size="sm"
                      onClick={() => setOpenModalPay(true)}
                    >
                      Agregar soporte de pago
                    </Button>
                  </div>

                  {elem.adminFees.length === 0 ? (
                    <Text size="sm" className="text-gray-500">
                      No hay pagos registrados
                    </Text>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                      {elem.adminFees.map((pago, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border bg-gray-50"
                        >
                          <Text size="sm" font="semi">
                            {pago.type}
                          </Text>
                          <Text size="xxs">{pago.dueDate}</Text>
                          <Text size="sm" className="text-gray-600">
                            {pago.amount}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INFO CONJUNTO */}
            <div className="bg-white border rounded-xl p-6 flex gap-6">
              <Avatar
                src={`${BASE_URL}/uploads/${conjuntoFile}`}
                alt="avatar conjunto"
                size="xl"
                border="none"
                shape="rounded"
              />

              <div>
                <Text font="bold">Información del conjunto</Text>
                <Text size="sm">
                  <b>Nombre:</b> {elem.conjunto.name}
                </Text>
                <Text size="sm">
                  <b>País:</b> {countryUnit}
                </Text>
                <Text size="sm">
                  <b>Ciudad:</b> {cityUnit}
                </Text>
              </div>
            </div>

            <ModalVipPay
              isOpen={openModalPay}
              id={elem.id}
              onClose={() => setOpenModalPay(false)}
            />
          </div>
        );
      })}
    </div>
  );
}
