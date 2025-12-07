import React, { useState } from "react";
import { Avatar, Button, Text } from "complexes-next-components";
import ModalVipPay from "./modal/modalVipPay";
import { useInfoQuery } from "./use-info-query";

export default function PersonalInfo() {
  const [openModalPay, setOpenModalPay] = useState(false);

  const { data = [], isLoading, error } = useInfoQuery();

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error cargando información</Text>;

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

          <div className="flex p-10 gap-6">
            <Avatar
              src="/complex.jpg"
              alt="complex"
              size="xxl"
              border="none"
              shape="rounded"
            />
            <div className="flex gap-12">
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
            </div>
          </div>

          <hr className="bg-gray-200 my-2" />
          <hr className="bg-gray-200 my-2" />

          <div className="flex p-10 gap-6">
            <Avatar
              src="/complex.jpg"
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
