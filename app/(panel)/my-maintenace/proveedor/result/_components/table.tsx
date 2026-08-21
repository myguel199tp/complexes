"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import { useLanguage } from "@/app/hooks/useLanguage";
import MessageNotConnect from "@/app/components/messageNotInfo";
import { useInfoProviderQuery } from "./provider-query";
import { ProviderResponse } from "../../../services/response/providerResponse";

export default function Tables() {
  const [filterText, setFilterText] = useState<string>("");

  const { t } = useTranslation();
  const { language } = useLanguage();

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
    "Origen",
  ];

  /**
   * Un proveedor que llegó por una alianza no se administra desde aquí: sus
   * datos los manda el comercio y su vigencia la define el contrato. Se marca
   * para que el administrador sepa a dónde ir si necesita cambiar algo.
   */
  const originLabel = (row: ProviderResponse) => {
    if (row.origin !== "b2b") return "Manual";
    return row.isActive ? "Aliado B2B" : "Aliado B2B (inactivo)";
  };

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
      originLabel(area),
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div key={language} className="w-full p-4">
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

      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          cellClasses={cellClasses}
          borderColor="text-gray-500"
          columnWidths={["25%", "20%", "15%", "25%", "15%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
