"use client";

import React from "react";
import {
  Badge,
  InputField,
  Table,
  Text,
  Tooltip,
} from "complexes-next-components";
import { FaEdit } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import useTableInfo from "./table-info";

export default function Tables() {
  const { data, error, filterText, setFilterText, t } = useTableInfo();

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div>{t("noHayRegistrosDisponibles")}</div>;
  }

  const headers = [
    t("titulo"),
    t("nombreUnidad"),
    t("estado"),
    t("inicioHora"),
    t("iniciFin"),
    t("descripcion"),
    t("acciones"),
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        String(user.activity)?.toLowerCase().includes(filterLower) ||
        String(user.nameUnit)?.toLowerCase().includes(filterLower) ||
        (user.status ? t("activado") : t("desactivado"))
          .toLowerCase()
          .includes(filterLower) ||
        String(user.dateHourStart)?.toLowerCase().includes(filterLower) ||
        String(user.dateHourEnd)?.toLowerCase().includes(filterLower) ||
        String(user.description)?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.activity || "",
      user.nameUnit || "",
      user.status ? t("activado") : t("desactivado"),
      user.dateHourStart || "",
      user.dateHourEnd || "",
      user.description || "",
      <div
        className="flex justify-center items-center gap-2"
        key={`edit-${user.id}`}
      >
        <Tooltip content={t("editar")} className="bg-gray-200">
          <button
            onClick={() => console.log("Editar:", user.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit size={20} />
          </button>
        </Tooltip>
      </div>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700")
  );

  return (
    <div className="w-full p-4">
      {/* 🏷️ Badge superior */}
      <div className="flex gap-4">
        <Badge background="primary" rounded="lg" role="contentinfo">
          {t("actividadesRegistradas")}:{" "}
          <Text as="span" font="bold">
            {filteredRows.length}
          </Text>
        </Badge>
      </div>

      {/* 🔍 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <div className="relative flex-1">
          <IoSearchCircle
            size={24}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <InputField
            placeholder={t("buscarNoticia")}
            helpText={t("buscarNoticia")}
            value={filterText}
            sizeHelp="sm"
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* 📋 Tabla estilizada */}
      <Table
        headers={headers}
        rows={filteredRows}
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["15%", "15%", "10%", "15%", "15%", "20%", "10%"]}
      />
    </div>
  );
}
