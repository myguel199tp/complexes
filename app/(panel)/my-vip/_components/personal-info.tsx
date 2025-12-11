import React, { useState } from "react";
import { Avatar, Button, Text } from "complexes-next-components";
import ModalVipPay from "./modal/modalVipPay";
import { useInfoQuery } from "./use-info-query";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);

  const { data = [], isLoading, error } = useInfoQuery();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error cargando información</Text>;
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <>
      {data.map((elem) => (
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
              <div>
                <Text font="bold">Información Personal</Text>
                <Text size="xs">
                  Nombre y apellido{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.name} {elem.user.lastName}
                  </Text>
                </Text>
                <Text size="xs">
                  Pais{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.country}
                  </Text>
                </Text>
                <Text size="xs">
                  ciudad{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.city}
                  </Text>
                </Text>
                <Text size="xs">
                  Indicativo{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.indicative}
                  </Text>
                </Text>
                <Text size="xs">
                  Telefono{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.phone}
                  </Text>
                </Text>
                <Text size="xs">
                  Correo electronico{" "}
                  <Text as="span" font="semi" size="sm">
                    {elem.user.email}
                  </Text>
                </Text>

                {elem.tower && elem.tower.trim() !== "" && (
                  <Text size="xs">
                    Torre{" "}
                    <Text as="span" font="semi" size="sm">
                      {elem.tower}
                    </Text>
                  </Text>
                )}

                {elem.apartment && elem.apartment.trim() !== "" && (
                  <Text size="xs">
                    Apartamento{" "}
                    <Text as="span" font="semi" size="sm">
                      {elem.apartment}
                    </Text>
                  </Text>
                )}
              </div>

              <div>
                <Text font="bold">Informacion familiar</Text>
                <Text size="xs">
                  Tiene mascota pet{" "}
                  <Text as="span" font="semi" size="sm">
                    Si
                  </Text>
                </Text>
              </div>

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
                Nombre del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.name}
                </Text>
              </Text>
              <Text size="xs">
                País del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.country}
                </Text>
              </Text>
              <Text size="xs">
                Barrio del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.neighborhood}
                </Text>
              </Text>
              <Text size="xs">
                Ciudad del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.city}
                </Text>
              </Text>
              <Text size="xs">
                Dirección del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.address}
                </Text>
              </Text>
              <Text size="xs">
                Plan del conjunto{" "}
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
      ))}
    </>
  );
}
