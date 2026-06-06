import React, { useState } from "react";
import { Avatar, Badge, Buton, Button, Text } from "complexes-next-components";
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
import useFeePaymentsTable from "../../my-fees/_components/useActivitTable";
import { useMyFeesThisMonthQuery } from "./use-fees-months-query";
import { useMyFeesQuery } from "./use-fees-query";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);
  const [openReferrals, setOpenReferrals] = useState(false);
  const { data: fees } = useFeePaymentsTable();
  console.log(fees);
  const { data: myFees } = useMyFeesQuery();
  const { data: monthFees } = useMyFeesThisMonthQuery();
  const userRolName = useConjuntoStore((state) => state.role);
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const router = useRouter();

  const { data, isLoading, error } = useInfoQuery();

  const { t } = useTranslation();
  const { language } = useLanguage();

  const list = Array.isArray(data) ? data : (data ?? []);
  const feeMap = (fees ?? []).reduce(
    (acc, fee) => {
      acc[fee.feeType] = Number(fee.amount);
      return acc;
    },
    {} as Record<string, number>,
  );
  const debtSummary = (myFees?.pending ?? []).reduce(
    (acc, fee) => {
      const type = fee.type || "SIN_TIPO";

      if (!acc[type]) {
        acc[type] = {
          count: 0,
          total: 0,
          unitValue: feeMap[type] ?? 0,
        };
      }

      acc[type].count += 1;
      acc[type].total += Number(fee.amount);

      return acc;
    },
    {} as Record<string, { count: number; total: number; unitValue: number }>,
  );

  const totalDebt = Object.values(debtSummary).reduce(
    (acc, item) => acc + item.total,
    0,
  );

  const totalCount = Object.values(debtSummary).reduce(
    (acc, item) => acc + item.count,
    0,
  );
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  if (error) return <MessageNotConnect />;

  if (!list.length) return null;

  if (!datacountry || !countryOptions || countryOptions.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const normalizePath = (path: string) => path.replace(/\\/g, "/");
  return (
    <div key={language} className="space-y-10">
      {list.map((elem) => {
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
          <div key={elem.id} className="space-y-5">
            <div className="rounded-xl border bg-gradient-to-r from-cyan-50 mt-2 to-blue-50 overflow-hidden">
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

            {/* CONJUNTO */}
            <div className="bg-white border rounded-xl p-4 flex gap-6">
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
                <Text size="sm">
                  <b>dirección:</b> {elem.conjunto.address}
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* USER */}
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
                    <Text size="sm" className="text-gray-500">
                      {elem.tower} - {elem.apartment}
                    </Text>
                  </div>
                </div>
                <section className="flex justify-between">
                  <div>
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
                  <div>
                    {elem.vehicles.map((ele) => (
                      <div key={ele.id}>
                        <Text size="xs">{ele.plaque}</Text>
                        <Text size="xs">{ele.assignmentNumber}</Text>
                        <Text size="xs">{ele.type}</Text>
                        <Text size="xs">{ele.parkingType}</Text>
                      </div>
                    ))}
                  </div>
                </section>
                {/* CERTIFICADOS */}
              </div>

              {/* FAMILIA */}
              {/* FAMILIA */}
              {["owner", "tenant"].includes(userRolName) && (
                <div className="bg-white border rounded-xl p-6">
                  <Text font="bold">{t("familair")}</Text>

                  {familyInfo.length === 0 ? (
                    <Text size="sm" className="text-gray-500 mt-2">
                      No hay información familiar
                    </Text>
                  ) : (
                    familyInfo.map((fam) => (
                      <div key={fam.numberId} className="mt-3 border-t pt-2">
                        <Text font="semi">
                          {fam.nameComplet}-{fam.lastComplet}
                        </Text>

                        <Text size="sm" className="text-gray-500">
                          {fam.relation}
                        </Text>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* PAGOS */}
            </div>

            {userRolName === "owner" && (
              <div className="bg-white border rounded-xl p-6 flex flex-col gap-5">
                {/* HEADER */}
                <div className="flex flex-col gap-3">
                  <Text font="bold" size="lg">
                    Pagos
                  </Text>

                  <Button
                    colVariant="success"
                    size="sm"
                    onClick={() => setOpenModalPay(true)}
                  >
                    Agregar soporte de pago
                  </Button>
                </div>

                {/* RESUMEN */}
                {/* 🔴 RESUMEN DE DEUDA (NUEVO - ARRIBA DEL RESUMEN NUMÉRICO) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <Text font="bold" size="lg">
                    💰 Resumen de deuda
                  </Text>

                  {totalCount === 0 ? (
                    <div className="mt-2">
                      <Text size="sm" className="text-green-600">
                        🟢 Estás al día con todas tus obligaciones
                      </Text>
                    </div>
                  ) : (
                    <>
                      {/* TOTAL GENERAL */}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-white border rounded-lg p-3 text-center">
                          <Text font="bold">{totalCount}</Text>
                          <Text size="xs">Cuotas pendientes</Text>
                        </div>

                        <div className="bg-white border rounded-lg p-3 text-center">
                          <Text font="bold">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                            }).format(totalDebt)}
                          </Text>
                          <Text size="xs">Deuda total</Text>
                        </div>
                      </div>

                      {/* DETALLE POR TIPO */}
                      <div className="mt-4 space-y-2">
                        {Object.entries(debtSummary).map(([type, data]) => {
                          const severity =
                            data.count >= 3
                              ? "text-red-600"
                              : data.count === 2
                                ? "text-orange-500"
                                : "text-yellow-600";

                          return (
                            <div
                              key={type}
                              className="flex justify-between items-center bg-white border rounded-lg p-3"
                            >
                              <div>
                                <Text font="semi">
                                  {type === "Cuota de administración"
                                    ? "Administración"
                                    : type}
                                </Text>

                                <Text size="xs" className="text-gray-500">
                                  Valor unidad:{" "}
                                  {new Intl.NumberFormat("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                  }).format(data.unitValue)}
                                </Text>
                              </div>

                              <div className="text-right">
                                <Text className={severity} font="bold">
                                  {data.count} cuota{data.count > 1 ? "s" : ""}
                                </Text>

                                <Text size="xs">
                                  {new Intl.NumberFormat("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                  }).format(data.total)}
                                </Text>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                {/* ALERTA MES ACTUAL */}
                {(monthFees?.length ?? 0) > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <Text font="bold">
                      ⚠️ Cuotas pendientes este mes: {monthFees?.length ?? 0}
                    </Text>

                    <Text size="sm">
                      Total a pagar:{" "}
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }).format(
                        monthFees?.reduce(
                          (acc, fee) => acc + Number(fee.amount),
                          0,
                        ) ?? 0,
                      )}
                    </Text>
                  </div>
                )}

                {/* LISTA DE PAGOS */}
                {elem.adminFees.length === 0 ? (
                  <Text size="sm" className="text-gray-500">
                    No hay pagos registrados
                  </Text>
                ) : (
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {[...(myFees?.pending ?? []), ...(myFees?.paid ?? [])].map(
                      (pago) => (
                        <div
                          key={pago.id}
                          className="p-3 rounded-lg border bg-gray-50 flex flex-col gap-1"
                        >
                          {/* STATUS MEJORADO */}
                          <Badge
                            colVariant={
                              pago.status === "APPROVED"
                                ? "success"
                                : pago.status === "REJECTED"
                                  ? "danger"
                                  : "warning"
                            }
                            font="bold"
                            size="sm"
                          >
                            {pago.status === "APPROVED"
                              ? "Pagado"
                              : pago.status === "REJECTED"
                                ? "Rechazado"
                                : "Pendiente"}
                          </Badge>

                          {/* TIPO */}
                          <Text size="sm" font="semi">
                            {pago.type}
                          </Text>

                          {/* FECHA MÁS LEGIBLE */}
                          <Text size="xs" className="text-gray-500">
                            {new Date(pago.dueDate).toLocaleDateString(
                              "es-CO",
                              {
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </Text>

                          {/* MONTO */}
                          <Text size="sm" font="bold">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(Number(pago.amount))}
                          </Text>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}

            {elem.certification && elem.certification.length > 0 && (
              <div className="bg-white border rounded-xl p-6 flex flex-col gap-3">
                <Text font="bold">Certificados</Text>

                <div className="space-y-2">
                  {elem.certification.map((cert) => {
                    const fileUrl = `${BASE_URL}/${normalizePath(cert.file)}`;

                    return (
                      <div
                        key={cert.id}
                        className="p-3 rounded-lg border bg-gray-50 flex flex-col gap-1"
                      >
                        <Text font="semi">{cert.type}</Text>

                        <Text size="xs" className="text-gray-500">
                          {cert.description}
                        </Text>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm underline"
                        >
                          Ver PDF
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <ModalVipPay
              isOpen={openModalPay}
              id={elem.id}
              fees={fees ?? []}
              onClose={() => setOpenModalPay(false)}
            />
          </div>
        );
      })}
    </div>
  );
}
