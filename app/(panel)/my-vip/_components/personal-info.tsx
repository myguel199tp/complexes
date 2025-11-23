import React from "react";
import { Avatar, Text } from "complexes-next-components";
import { useQuery } from "@tanstack/react-query";
import { allUserVipService } from "../services/myVipInfoService";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
const payload = getTokenPayload();

export default function PersonalInfo() {
  const userId = typeof window !== "undefined" ? payload?.id : null;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userVipInfo", userId, conjuntoId],
    queryFn: () => allUserVipService(String(conjuntoId), String(userId)),
    enabled: !!conjuntoId && !!userId,
  });

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error cargando información</Text>;

  console.log(data);
  return (
    <>
      {data.map((elem) => (
        <div key={elem.id}>
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
                  cuidad{" "}
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
              <Text font="bold">Información del conjunto </Text>
              <Text size="xs">
                Nombre del conjunto{" "}
                <Text as="span" font="semi" size="sm">
                  {elem.conjunto.name}
                </Text>
              </Text>
              <Text size="xs">
                Pais del conjunto{" "}
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
        </div>
      ))}
    </>
  );
}
