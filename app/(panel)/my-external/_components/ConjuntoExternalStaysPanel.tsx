"use client";

import React, { useMemo, useState } from "react";
import { InputField, Table, Tabs, Text, Title } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { IoSearchCircle } from "react-icons/io5";
import { useConjuntoExternalStaysQuery } from "./use-conjunto-stays-query";
import { ConjuntoExternalStayResponse } from "../services/response/conjuntoExternalStaysResponse";

const platformLabel: Record<string, string> = {
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "VRBO",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

const formatDate = (dateStr: string): string =>
  dateStr ? new Date(`${dateStr}T00:00:00`).toLocaleDateString("es-CO") : "-";

const headers = [
  "Inmueble",
  "Unidad / Torre / Apto",
  "Plataforma",
  "Huésped",
  "Estadía",
  "Huéspedes",
  "Código portería",
  "Comisión",
];

/**
 * El `Table` del paquete compone con clsx (no tailwind-merge) y arrastra su
 * `bg-transparent` por defecto. Como Tailwind emite las utilidades en orden
 * alfabético, `bg-green-50` y `bg-red-50` quedan antes de `bg-transparent` y la
 * fila se ve transparente sobre el fondo oscuro. El `!` fuerza la prioridad.
 */
const rowBackground = (item: ConjuntoExternalStayResponse) => {
  if (item.estado === "CANCELLED") return "!bg-red-50 text-gray-900";
  if (item.estaHoy) return "!bg-green-50 text-gray-900";
  return "!bg-white text-gray-900";
};

function StaysTable({
  items,
  emptyMessage,
}: {
  items: ConjuntoExternalStayResponse[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <div className="text-gray-400 py-6 text-center">{emptyMessage}</div>;
  }

  const rows = items.map((item) => [
    item.inmueble?.nombre || "-",
    `${item.inmueble?.unidad || "-"} / ${item.inmueble?.torre || "-"} / ${
      item.inmueble?.apartamento || "-"
    }`,
    platformLabel[item.plataforma] || item.plataforma,
    `${item.huesped?.nombre || "-"} · ${item.huesped?.email || "-"}`,
    `${formatDate(item.fechas?.entrada)} → ${formatDate(item.fechas?.salida)}`,
    String(item.huespedes ?? 0),
    item.accesoRevocado
      ? `${item.codigoAcceso || "-"} (revocado)`
      : item.codigoAcceso || "-",
    statusLabel[item.estado] || item.estado,
  ]);

  const cellClasses = items.map((item) =>
    headers.map(() => rowBackground(item)),
  );

  return (
    <Table
      headers={headers}
      rows={rows}
      cellClasses={cellClasses}
      borderColor="text-gray-500"
      columnWidths={["14%", "16%", "9%", "20%", "16%", "7%", "10%", "8%"]}
    />
  );
}

/**
 * Control de la administración sobre los turistas que entraron por Airbnb,
 * Booking o VRBO. La venta ocurrió fuera de la plataforma, así que esta tabla
 * es el único lugar donde el conjunto se entera de que hay alguien adentro.
 */
export default function ConjuntoExternalStaysPanel() {
  const { data = [], isLoading, error } = useConjuntoExternalStaysQuery();
  const [filterText, setFilterText] = useState("");

  const insideToday = useMemo(
    () => data.filter((item) => item.estaHoy).length,
    [data],
  );

  const searched = useMemo(() => {
    const q = filterText.toLowerCase();
    if (!q) return data;

    return data.filter((item) =>
      [
        item.inmueble?.nombre,
        item.inmueble?.unidad,
        item.inmueble?.torre,
        item.inmueble?.apartamento,
        item.huesped?.nombre,
        item.huesped?.email,
        item.codigoAcceso,
        platformLabel[item.plataforma] || item.plataforma,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [data, filterText]);

  const tabs = [
    {
      tKey: "Dentro hoy",
      background: "primary",
      children: (
        <StaysTable
          items={searched.filter((item) => item.estaHoy)}
          emptyMessage="No hay huéspedes externos dentro del conjunto hoy."
        />
      ),
    },
    {
      tKey: "Historial completo",
      background: "primary",
      children: (
        <StaysTable
          items={searched}
          emptyMessage="Todavía no hay reservas externas registradas en este conjunto."
        />
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <Title size="sm" font="bold" colVariant="on">
        Huéspedes de plataformas externas
      </Title>
      <Text size="sm" className="text-gray-400 mb-3">
        Reservas vendidas en Airbnb, Booking o VRBO por los propietarios del
        conjunto. Hoy hay {insideToday} dentro.
      </Text>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <ImSpinner9 className="animate-spin text-cyan-800" size={36} />
        </div>
      ) : error ? (
        <div className="text-red-500 py-6">
          No pudimos cargar los huéspedes externos del conjunto.
        </div>
      ) : (
        <>
          <InputField
            placeholder="Buscar"
            helpText="Buscar por inmueble, huésped, plataforma o código"
            value={filterText}
            prefixElement={<IoSearchCircle />}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            onChange={(e) => setFilterText(e.target.value)}
            className="mb-3"
          />

          <Tabs defaultActiveIndex={0} tabs={tabs} />
        </>
      )}
    </div>
  );
}
