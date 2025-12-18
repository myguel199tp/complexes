import React, { useState } from "react";
import { Avatar, Buton, Button, Text } from "complexes-next-components";
import ModalVipPay from "./modal/modalVipPay";
import { useInfoQuery } from "./use-info-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { FamilyInfo } from "../../my-new-user/services/request/register";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openReferrals, setOpenReferrals] = useState(false);
  const router = useRouter();

  const { data = [], isLoading, error } = useInfoQuery();
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error cargando información</Text>;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div key={language} className="space-y-10">
      {data.map((elem) => {
        /* ===================== */
        /* FAMILY INFO (SEGURO) */
        /* ===================== */
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
                    Invita a otros residentes o administradores a usar la
                    plataforma y obtén beneficios exclusivos.
                  </Text>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xl">{openReferrals ? "▲" : "▼"}</span>
                </div>
              </button>

              {openReferrals && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <Text font="semi">🎁 Beneficios</Text>
                      <Text size="sm" className="text-gray-600 mt-1">
                        Descuentos, meses gratis o beneficios VIP.
                      </Text>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <Text font="semi">👥 Sin límite</Text>
                      <Text size="sm" className="text-gray-600 mt-1">
                        Entre más refieras, mayores beneficios.
                      </Text>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <Text font="semi">⚡ Fácil</Text>
                      <Text size="sm" className="text-gray-600 mt-1">
                        Comparte por WhatsApp o redes sociales.
                      </Text>
                    </div>
                  </div>

                  <section className="flex justify-between">
                    <div className="mt-6">
                      <Text font="semi">¿Cómo funciona?</Text>
                      <ol className="list-decimal ml-5 mt-2 text-sm text-gray-700 space-y-1">
                        <li>Comparte tu enlace.</li>
                        <li>El invitado se registra.</li>
                        <li>Recibes el beneficio.</li>
                      </ol>
                    </div>
                    <Buton
                      colVariant="primary"
                      borderWidth="none"
                      rounded="md"
                      type="button"
                      size="lg"
                      onClick={() => {
                        router.push(route.myreferal);
                      }}
                    >
                      Invitar ahora
                    </Buton>
                  </section>
                </div>
              )}
            </div>

            {/* ===================== */}
            {/* INFO EN CARDS */}
            {/* ===================== */}
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
                <Text font="semi">{elem.user.country}</Text>

                <Text size="xs" className="text-gray-500 mt-2">
                  Ciudad
                </Text>
                <Text font="semi">{elem.user.city}</Text>
              </div>

              {/* FAMILIA */}
              <div className="bg-white border rounded-xl p-6">
                <Text font="bold">{t("familair")}</Text>

                {familyInfo.length === 0 && (
                  <Text size="sm" className="text-gray-500 mt-2">
                    No hay información familiar
                  </Text>
                )}

                {familyInfo.map((fam) => (
                  <div key={fam.email} className="mt-3 border-t pt-2">
                    <Text font="semi">{fam.nameComplet}</Text>
                    <Text size="sm" className="text-gray-500">
                      {fam.relation}
                    </Text>
                  </div>
                ))}
              </div>

              {/* PAGOS */}
              <div className="bg-white border rounded-xl p-6">
                <Text font="bold">Pagos</Text>
                <Button
                  colVariant="warning"
                  size="sm"
                  onClick={() => setOpenModalPay(true)}
                >
                  Agregar soporte de pago
                </Button>
                {elem.adminFees.length === 0 && (
                  <Text size="sm" className="text-gray-500 mt-2">
                    No hay pagos registrados
                  </Text>
                )}

                {elem.adminFees.map((pago, index) => (
                  <div
                    key={index}
                    className="mt-3 p-3 rounded-lg border bg-gray-50"
                  >
                    <Text font="semi">{pago.type}</Text>
                    <Text size="sm" className="text-gray-600">
                      {pago.amount}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* ===================== */}
            {/* INFO CONJUNTO */}
            {/* ===================== */}
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
                <Text size="sm" className="mt-2">
                  <b>Nombre:</b> {elem.conjunto.name}
                </Text>
                <Text size="sm">
                  <b>Ciudad:</b> {elem.conjunto.city}
                </Text>
                <Text size="sm">
                  <b>Plan:</b> {elem.conjunto.plan}
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
