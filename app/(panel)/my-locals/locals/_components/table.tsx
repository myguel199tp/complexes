"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import MessageNotConnect from "@/app/components/messageNotInfo";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useLocalsQuery } from "./locals-query";

export default function LocalsTable() {
  const [filterText, setFilterText] = useState("");

  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading, error } = useLocalsQuery();

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">{t("cargando")}</div>
    );
  }

  if (error) {
    return <MessageNotConnect />;
  }

  const headers = [
    "Nombre del local",
    "Actividad",
    "Propietario",
    "Celular",
    "Conjunto",
  ];

  const filteredRows = (data || [])
    .filter((local) => {
      const filterLower = filterText.toLowerCase();

      return (
        local.name?.toLowerCase().includes(filterLower) ||
        local.kindOfBusiness?.toLowerCase().includes(filterLower) ||
        local.ownerName?.toLowerCase().includes(filterLower) ||
        local.phone?.toLowerCase().includes(filterLower) ||
        local.conjunto?.name?.toLowerCase().includes(filterLower)
      );
    })
    .map((local) => [
      local.name || "",
      local.kindOfBusiness || "",
      `${local.ownerName || ""} ${local.ownerLastName || ""}`,
      local.phone || "",
      local.conjunto?.name || "",
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div key={language} className="w-full p-4">
      {/* 🔍 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder={t("buscar")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* 📋 Tabla */}
      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          cellClasses={cellClasses}
          borderColor="text-gray-500"
          columnWidths={["20%", "20%", "25%", "15%", "20%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
