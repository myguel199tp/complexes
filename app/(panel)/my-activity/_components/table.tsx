"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allActivityService } from "../services/activityAllServices";
import { ActivityResponse } from "../services/response/activityResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { IoSearchCircle } from "react-icons/io5";

export default function Tables() {
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      if (!infoConjunto) return;
      try {
        const result = await allActivityService(infoConjunto);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorDesconocido"));
      }
    };
    fetchData();
  }, [infoConjunto, t]);

  if (error) {
    return <div>{error}</div>;
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
      user.status ? t("activado") : t("desactivado"),
      user.dateHourStart || "",
      user.dateHourEnd || "",
      user.description || "",
      <button
        key={`edit-${user.id}`}
        onClick={() => console.log("Editar:", user.id)}
        className="text-blue-600 hover:text-blue-800"
      >
        <FaEdit size={20} />
      </button>,
    ]);

  const cellClasses = headers.map(() => ["", "", ""]);

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
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["15%", "15%", "15%", "20%", "10%", "10%", "10%"]}
      />
    </div>
  );
}
