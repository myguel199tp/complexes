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
        // FAMILY INFO (PARSEO SEGURO)
        // ------------------------------
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

        // ------------------------------
        // AVATAR USER (SEGURO)
        // ------------------------------
        const userFile =
          elem?.user?.file && typeof elem.user.file === "string"
            ? elem.user.file.replace(/^.*[\\/]/, "")
            : "default-avatar.png";

        // ------------------------------
        // AVATAR CONJUNTO (SEGURO)
        // ------------------------------
        const conjuntoFile =
          elem?.conjunto?.file && typeof elem.conjunto.file === "string"
            ? elem.conjunto.file.replace(/^.*[\\/]/, "")
            : "default-complex.png";

        return (
          <div key={elem.id}>
            <Button
              colVariant="warning"
              className="mt-2"
              onClick={() => setOpenModalPay(true)}
            >
              Agregar soporte de pago
            </Button>

            {/* ===================== */}
            {/* INFORMACIÓN PERSONAL */}
            {/* ===================== */}
            <div className="flex flex-col md:!flex-row p-10 gap-6">
              <Avatar
                src={`${BASE_URL}/uploads/${userFile}`}
                alt="avatar usuario"
                size="xxl"
                border="none"
                shape="rounded"
              />

              <div className="flex flex-col md:!flex-row gap-12">
                <div>
                  <Text font="bold">{t("personal")}</Text>

                  <Text size="xs">{t("nombreApellido")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.name} {elem.user.lastName}
                  </Text>

                  <Text size="xs">{t("pais")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.country}
                  </Text>

                  <Text size="xs">{t("ciudad")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.city}
                  </Text>

                  <Text size="xs">{t("indicativo")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.indicative}
                  </Text>

                  <Text size="xs">{t("celular")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.phone}
                  </Text>

                  <Text size="xs">{t("correo")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.email}
                  </Text>

                  {elem.tower?.trim() && (
                    <>
                      <Text size="xs">{t("torre")}</Text>
                      <Text as="span" font="semi" size="sm">
                        {elem.tower}
                      </Text>
                    </>
                  )}

                  {elem.apartment?.trim() && (
                    <>
                      <Text size="xs">Apartamento</Text>
                      <Text as="span" font="semi" size="sm">
                        {elem.apartment}
                      </Text>
                    </>
                  )}
                </div>

                {/* ===================== */}
                {/* INFORMACIÓN FAMILIAR */}
                {/* ===================== */}
                <div>
                  <Text font="bold">{t("familair")}</Text>

                  <Text size="xs">{t("pet")}</Text>
                  <Text as="span" font="semi" size="sm">
                    {elem.user.pet ? "Sí" : "No"}
                  </Text>

                  {familyInfo.map((fam) => (
                    <div key={fam.email} className="mt-4">
                      <Text size="xs">{t("nombreApellido")}</Text>
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

                {/* ===================== */}
                {/* PAGOS */}
                {/* ===================== */}
                <div>
                  <Text font="bold">Pagos</Text>
                  {elem.adminFees.map((pago, index) => (
                    <div
                      key={`${pago?.id ?? "pago"}-${index}`}
                      className="max-h-40 overflow-y-auto mt-2 border p-2 rounded"
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

            {/* ===================== */}
            {/* INFORMACIÓN CONJUNTO */}
            {/* ===================== */}
            <div className="flex flex-col md:!flex-row p-10 gap-6">
              <Avatar
                src={`${BASE_URL}/uploads/${conjuntoFile}`}
                alt="avatar conjunto"
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
