import React, { useState } from "react";
import { Avatar, Button, Text } from "complexes-next-components";
import ModalVipPay from "./modal/modalVipPay";
import { useInfoQuery } from "./use-info-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { FamilyInfo } from "../../my-new-user/services/request/register";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);

  const { data = [], isLoading, error } = useInfoQuery();
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error cargando información</Text>;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <div key={language}>
      {data.map((elem) => {
        // ------------------------------
        // PARSEAR FAMILY INFO CORRECTAMENTE
        // ------------------------------
        let familyInfo = [];

        if (typeof elem?.user?.familyInfo === "string") {
          familyInfo = JSON.parse(elem.user.familyInfo);
        } else if (Array.isArray(elem?.user?.familyInfo)) {
          familyInfo = elem.user.familyInfo;
        }

        return (
          <div key={elem.id}>
            <Button
              colVariant="warning"
              className="mt-2"
              onClick={() => setOpenModalPay(true)}
            >
              Agergar soporte de pago
            </Button>

            <div className="flex flex-col md:!flex-row p-10 gap-6">
              <Avatar
                src={`${BASE_URL}/uploads/${elem.user.file.replace(
                  /^.*[\\/]/,
                  ""
                )}`}
                alt="complex"
                size="xxl"
                border="none"
                shape="rounded"
              />

              <div className="flex flex-col md:!flex-row gap-12">
                {/* INFORMACION PERSONAL */}
                <div>
                  <Text font="bold" tKey={t("personal")}>
                    Información Personal
                  </Text>

                  <Text size="xs" tKey={t("nombreApellido")}>
                    Nombre y apellido{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.name} {elem.user.lastName}
                  </Text>

                  <Text size="xs" tKey={t("pais")}>
                    Pais{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.country}
                  </Text>

                  <Text size="xs" tKey={t("ciudad")}>
                    Ciudad{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.city}
                  </Text>

                  <Text size="xs" tKey={t("indicativo")}>
                    Indicativo{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.indicative}
                  </Text>

                  <Text size="xs" tKey={t("celular")}>
                    Celular{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.phone}
                  </Text>

                  <Text size="xs" tKey={t("correo")}>
                    Correo electrónico{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.email}
                  </Text>

                  {elem.tower && elem.tower.trim() !== "" && (
                    <>
                      <Text size="xs" tKey={t("torre")}>
                        Torre o Bloque{" "}
                      </Text>
                      <Text as="span" font="semi" size="sm">
                        {elem.tower}
                      </Text>
                    </>
                  )}

                  {elem.apartment && elem.apartment.trim() !== "" && (
                    <>
                      <Text size="xs">Apartamento </Text>
                      <Text as="span" font="semi" size="sm">
                        {elem.apartment}
                      </Text>
                    </>
                  )}
                </div>

                {/* INFORMACION FAMILIAR */}
                <div>
                  <Text font="bold" tKey={t("familair")}>
                    Información familiar
                  </Text>

                  <Text size="xs" tKey={t("pet")}>
                    Mascota{" "}
                  </Text>
                  <Text as="span" font="semi" size="sm">
                    {elem?.user?.pet ? "Sí" : "No"}
                  </Text>

                  {familyInfo.map((fam: FamilyInfo) => (
                    <div key={fam.email} className="mt-4">
                      <Text size="xs" tKey={t("nombreApellido")}>
                        Nombre y apellido{" "}
                      </Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.nameComplet}
                      </Text>

                      <Text size="xs">Cédula:</Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.numberId}
                      </Text>

                      <Text size="xs">Fecha de nacimiento:</Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.dateBorn}
                      </Text>

                      <Text size="xs">Relación:</Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.relation}
                      </Text>

                      <Text size="xs">Email:</Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.email}
                      </Text>

                      <Text size="xs">Teléfono:</Text>
                      <Text as="span" font="semi" size="sm">
                        {fam.phones}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* PAGOS */}
                <div>
                  <Text font="bold">Pagos</Text>
                  {elem.adminFees.map((pago, index) => (
                    <div
                      className="max-h-40 overflow-y-auto mt-2 border p-2 rounded"
                      key={`${pago?.id ?? "pago"}-${index}`}
                    >
                      <Text font="semi" size="sm">
                        {pago.type}
                      </Text>
                      <Text size="sm">{pago.dueDate}</Text>
                      <Text size="sm" className="mt-2">
                        {pago.description}
                      </Text>
                      <Text size="sm">{pago.amount}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="bg-gray-200 my-2" />
            <hr className="bg-gray-200 my-2" />

            {/* INFORMACIÓN DEL CONJUNTO */}
            <div className="flex flex-col md:!flex-row p-10 gap-6">
              <Avatar
                src={`${BASE_URL}/uploads/${elem.conjunto.file.replace(
                  /^.*[\\/]/,
                  ""
                )}`}
                alt="complex"
                size="xxl"
                border="none"
                shape="rounded"
              />

              <div>
                <Text font="bold">Información del conjunto</Text>

                <Text size="xs">
                  Nombre:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.name}
                  </Text>
                </Text>

                <Text size="xs">
                  País:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.country}
                  </Text>
                </Text>

                <Text size="xs">
                  Barrio:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.neighborhood}
                  </Text>
                </Text>

                <Text size="xs">
                  Ciudad:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.city}
                  </Text>
                </Text>

                <Text size="xs">
                  Dirección:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.address}
                  </Text>
                </Text>

                <Text size="xs">
                  Plan:{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.conjunto.plan}
                  </Text>
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
