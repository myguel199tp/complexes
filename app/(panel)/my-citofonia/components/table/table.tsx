"use client";

import React from "react";
import { Badge, InputField, Table, Text } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useTableInfo } from "./table-info";

export default function Tables() {
  const { error, headers, filteredRows, filterText, setFilterText, t } =
    useTableInfo();

  // ⚙️ Clases por celda con estilo similar a las otras tablas
  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700")
  );

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full p-4">
      {/* 🏷️ Badge superior */}
      <div className="flex gap-4">
        <Badge background="primary" rounded="lg" role="contentinfo">
          {t("registrosTotales")}:{" "}
          <Text as="span" font="bold">
            {filteredRows.length}
          </Text>
        </Badge>
      </div>

      {/* 🔍 Buscador igual al de las otras tablas */}
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

      {/* 🧾 Tabla con mismo estilo */}
      <Table
        headers={headers}
        rows={filteredRows}
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["20%", "20%", "20%", "20%", "20%"]}
      />
    </div>
  );
}
