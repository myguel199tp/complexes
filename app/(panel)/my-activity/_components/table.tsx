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
import useActivityTable from "./table-info";

export default function Tables() {
  const { data, error, filterText, setFilterText, updateStatusLocally, t } =
    useActivityTable();

  if (error) return <div className="text-red-500">{String(error)}</div>;

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
      const filterLower = filterText.toLowerCase();
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

      // ✔️ switch con React Query (optimistic update)
      <div
        key={`switch-${user.id}`}
        className="flex justify-center items-center pointer-events-auto"
      >
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={user.status || false}
            onChange={(e) => {
              const newStatus = e.target.checked;
              updateStatusLocally(Number(user.id), newStatus);
            }}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-cyan-800
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:border-gray-300 after:border after:rounded-full
          after:h-5 after:w-5 after:transition-all duration-300 ease-in-out
          peer-checked:after:translate-x-full"
          ></div>
        </label>
      </div>,

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
      {/* Badge */}
      <div className="flex gap-4">
        <Badge background="primary" rounded="lg" role="contentinfo">
          {t("actividadesRegistradas")}:{" "}
          <Text as="span" font="bold">
            {filteredRows.length}
          </Text>
        </Badge>
      </div>

      {/* Search */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder={t("buscarNoticia")}
          helpText={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Tabla */}
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
