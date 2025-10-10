"use client";

import React from "react";
import { InputField, Table } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useTableInfo } from "./table-info";

export default function Tables() {
  const { error, headers, filteredRows, filterText, setFilterText, t } =
    useTableInfo();

  const cellClasses = [
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ];

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full p-4">
      <div className="relative mt-4 w-full">
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

      <Table
        headers={headers}
        rows={filteredRows}
        borderColor="text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["15%", "15%", "15%", "15%"]}
      />
    </div>
  );
}
