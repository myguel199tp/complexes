"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Avatar } from "complexes-next-components";
import { useConjuntoStore } from "./use-store";
import { useEnsembleInfo } from "./ensemble-info";
import { ImSpinner9 } from "react-icons/im";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";

export default function Ensemble() {
  const { data, loading } = useEnsembleInfo();
  const router = useRouter();
  const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
  const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);

  const roleTranslations: Record<string, string> = {
    owner: "Propietario",
    tenant: "Inquilino",
    resident: "Residente",
    visitor: "Visitante",
    employee: "Trabajo",
  };

  const [navigating, setNavigating] = useState(false);
  const { countryOptions, data: datacountry } = useCountryCityOptions();

  if (loading || navigating)
    return (
      <div className="w-full items-center justify-center">
        <ImSpinner9 />
      </div>
    );

  if (!data.length) return <div>No hay datos</div>;

  return (
    <div className="flex flex-row items-center gap-4 h-screen justify-center">
      {data.map((item) => {
        const { id, apartment, role, isMainResidence, active, conjunto } = item;
        const fileImage = conjunto?.file || "";

        const BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const fileName = fileImage
          ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
          : "";

        // ✅ Obtener labels dentro del map
        const countryLabel =
          countryOptions.find((c) => c.value === String(conjunto.country))
            ?.label || conjunto.country;

        const cityLabel =
          datacountry
            ?.find((c) => String(c.ids) === String(conjunto.country))
            ?.city.find((c) => String(c.id) === String(conjunto.city))?.name ||
          conjunto.city;

        return (
          <div
            key={id}
            className="w-full max-w-md bg-white p-4 hover:bg-cyan-800 hover:text-white rounded-lg shadow-2xl cursor-pointer"
            onClick={() => {
              setConjuntoId(conjunto.id);
              setConjuntoName(conjunto.name);

              setNavigating(true); // 👈 mostramos el "cargando"
              router.push(route.myprofile);
            }}
          >
            <section className="flex justify-between">
              <div>
                <Title className="text-xl font-semibold">{conjunto.name}</Title>
                <Text size="sm" font="semi">
                  {conjunto.address}
                </Text>

                {/* ✅ Mostrar nombres legibles */}
                <Text size="sm" font="semi">
                  {countryLabel} | {cityLabel} | {conjunto.neighborhood}
                </Text>

                <hr className="my-2" />
                <hr className="my-2" />

                {apartment !== null && (
                  <Text size="sm">
                    <Text font="bold">Apartamento</Text> {apartment}
                  </Text>
                )}

                <Text size="sm" font="semi" className="mt-4">
                  {roleTranslations[role] || role}
                </Text>

                {isMainResidence !== null && (
                  <Text size="sm" font="semi">
                    {isMainResidence ? "Residencia principal" : "No Recide"}
                  </Text>
                )}

                {active !== null && (
                  <Text size="sm" font="semi">
                    {active ? "Activado" : "Desactivado"}
                  </Text>
                )}
              </div>

              <div className="flex justify-end">
                <Avatar
                  src={fileName}
                  alt={`${conjunto.name}`}
                  size="xl"
                  border="thick"
                  shape="rounded"
                />
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
