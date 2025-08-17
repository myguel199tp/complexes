"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Avatar } from "complexes-next-components";
import { useConjuntoStore } from "./use-store";
import { useEnsembleInfo } from "./ensemble-info";

export default function Ensemble() {
  const { data, loading } = useEnsembleInfo();
  const router = useRouter();
  const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
  const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);

  if (loading) return <div>Cargando…</div>;
  if (!data.length) return <div>No hay datos</div>;

  return (
    <div className="flex flex-row items-center gap-4 h-full justify-center">
      {data.map((item) => {
        const { id, apartment, role, isMainResidence, active, conjunto } = item;
        const fileImage = conjunto?.file || "";

        const BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        const fileName = fileImage
          ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
          : "";

        return (
          <div
            key={id}
            className="w-full max-w-md bg-white p-4 hover:bg-cyan-800 rounded-lg shadow-2xl cursor-pointer"
            onClick={() => {
              setConjuntoId(conjunto.id); // guarda el id del conjunto seleccionado
              setConjuntoName(conjunto.name);
              router.push(route.myprofile); // redirecciona
            }}
          >
            <section className="flex justify-between">
              <div>
                <Title className="text-xl font-semibold">
                  Conjunto: {conjunto.name}
                </Title>
                <Text size="sm">
                  <Text font="bold">Apartamento</Text> {apartment}
                </Text>
                <Text size="sm">
                  <Text font="bold">Rol</Text>{" "}
                  {role === "owner" ? "Propietario" : "e"}
                </Text>
                <Text size="sm">
                  <Text font="bold">Residencia principal</Text>{" "}
                  {isMainResidence ? "Sí" : "No"}
                </Text>
                <Text size="sm">
                  <Text font="bold">Activo</Text> {active ? "Sí" : "No"}
                </Text>
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
            <hr className="my-2" />
            <section>
              <Text size="sm">
                <Text font="bold">Dirección</Text> {conjunto.address},{" "}
                {conjunto.city} ({conjunto.neighborhood})
              </Text>
              <Text size="sm">
                <Text font="bold">País</Text> {conjunto.country}
              </Text>
            </section>
          </div>
        );
      })}
    </div>
  );
}
