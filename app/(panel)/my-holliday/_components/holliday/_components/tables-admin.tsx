"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { useAdminHolidaysQuery } from "./use-admin-holidays-query";
import { ImSpinner9 } from "react-icons/im";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";

const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

export default function TablesAdminHoliday() {
  const { data = [], isLoading, error } = useAdminHolidaysQuery();
  const [filterText, setFilterText] = useState("");
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-60">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return <div>{t("errorDesconocido")}</div>;

  const headers = [
    "Nombre",
    "Unidad / Torre / Apto",
    "Estado",
    "Disponibilidad",
    "Alquilado",
    "Reservas",
  ];

  const filtered = data.filter((item) => {
    const q = filterText.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(q) ||
      item.unidad?.toLowerCase().includes(q) ||
      item.torre?.toLowerCase().includes(q) ||
      item.apartamento?.toLowerCase().includes(q) ||
      item.estado?.toLowerCase().includes(q)
    );
  });

  const rows = filtered.map((item) => [
    item.nombre || "-",
    `${item.unidad || "-"} / ${item.torre || "-"} / ${item.apartamento || "-"}`,
    item.estado || "-",
    `${formatDate(item.disponibleDesde)} → ${formatDate(item.disponibleHasta)}`,
    item.estaAlquilado ? "Sí" : "No",
    String(item.reservas?.length ?? 0),
  ]);

  const cellClasses = filtered.map((item) =>
    headers.map(() => {
      if (item.estaAlquilado) return "bg-green-50 text-gray-900";
      if (item.estado === "draft") return "bg-yellow-50 text-gray-900";
      return "bg-white text-gray-900";
    }),
  );

  if (filtered.length === 0) {
    return <MessageNotData />;
  }

  return (
    <div className="w-full p-4">
      <InputField
        placeholder="Buscar"
        helpText="Buscar por nombre, unidad, torre o estado"
        value={filterText}
        prefixElement={<IoSearchCircle />}
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-3"
      />
      <Table
        headers={headers}
        rows={rows}
        cellClasses={cellClasses}
        sizeText="sm"
        size="sm"
        fontText="bold"
        colVariant="primary"
        borderColor="text-gray-500"
        columnWidths={["18%", "20%", "12%", "20%", "10%", "10%"]}
      />
    </div>
  );
}
