"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import { useLanguage } from "@/app/hooks/useLanguage";
import MessageNotConnect from "@/app/components/messageNotInfo";
import { useInfoProviderQuery } from "./provider-query";

export default function Tables() {
  const [filterText, setFilterText] = useState<string>("");

  const { t } = useTranslation();
  const { language } = useLanguage();

  // 🔹 Usar query
  const { data, isLoading, error } = useInfoProviderQuery();

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">{t("cargando")}</div>
    );
  }

  if (error) {
    return <MessageNotConnect />;
  }

  const headers = [
    "Nombre delproveedor",
    "servicio",
    "Celular",
    "Correo electronico",
  ];

  // 🔹 Adaptar datos de CommonAreaResponse a la tabla (sin description ni ver más)
  const filteredRows = (data || [])
    .filter((area) => {
      const filterLower = filterText?.toLowerCase();
      return (
        area.name?.toLowerCase().includes(filterLower) ||
        area.service?.toLowerCase().includes(filterLower) ||
        area.phone?.toLowerCase().includes(filterLower) ||
        area.email?.toLowerCase().includes(filterLower)
      );
    })
    .map((area) => [
      area.name || "",
      area.service || "",
      area.phone || "",
      area.email || "",
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div key={language} className="w-full p-4">
      {/* 🔍 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          helpText={t("buscarNoticia")}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* 📋 Tabla o mensaje si no hay datos */}
      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          cellClasses={cellClasses}
          borderColor="text-gray-500"
          columnWidths={["40%", "60%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
