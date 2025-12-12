"use client";

import { Badge, InputField, Table, Text } from "complexes-next-components";
import React, { useState } from "react";
import useInfoPqr from "./useInfoPqr";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Tables() {
  const { data = [], error } = useInfoPqr();
  const [filterText, setFilterText] = useState("");
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (error) {
    return <div>{t("errorDesconocido")}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-16">
        <div className="text-center p-6 bg-white shadow rounded-2xl border border-gray-200">
          <Text size="lg" font="bold" className="text-gray-700">
            No hay Registros disponibles
          </Text>
          <Text size="sm" className="text-gray-500 mt-2">
            Intente mas tarde
          </Text>
        </div>
      </div>
    );
  }

  // 🧩 Encabezados consistentes
  const headers = [
    t("tipo"),
    t("radicado"),
    t("torre"),
    t("apartamento"),
    t("archivoPdf"),
  ];

  // 🔍 Filtro de búsqueda
  const filteredData = data.filter(
    (pqr) =>
      pqr.type.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.description.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.tower?.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.apartment?.toLowerCase().includes(filterText.toLowerCase()) ||
      pqr.radicado?.toLowerCase().includes(filterText.toLowerCase())
  );

  // 🧱 Filas y clases de celdas
  const rows = filteredData.map((pqr) => [
    pqr.type || "",
    pqr.radicado || "",
    pqr.tower || "",
    pqr.apartment || "",
    pqr.file ? (
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL}/${pqr.file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-800 underline"
      >
        {t("verPdf")}
      </a>
    ) : (
      t("sinArchivo")
    ),
  ]);

  const cellClasses = filteredData.map(() =>
    headers.map(() => "bg-white text-gray-700")
  );

  return (
    <div key={language} className="w-full p-4">
      {/* 🏷️ Badge superior como en la otra tabla */}
      <div className="flex gap-4">
        <Badge background="primary" size="sm" rounded="lg" role="contentinfo">
          {t("registrosTotales")}:{" "}
          <Text size="sm" as="span" font="bold">
            {rows.length}
          </Text>
        </Badge>
      </div>

      {/* 🔍 Buscador igual al otro componente */}
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

      {/* 🧾 Tabla con el mismo estilo */}
      <Table
        headers={headers}
        rows={rows}
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["20%", "20%", "20%", "20%", "20%"]}
      />
    </div>
  );
}
