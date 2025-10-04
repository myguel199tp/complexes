"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { allNewsService } from "../services/newsAllServices";
import { NewsResponse } from "../services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";

export default function Tables() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();

  // Estado para manejar qué filas están expandidas
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (!conjuntoId) return;

    const fetchData = async () => {
      try {
        const result = await allNewsService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [t("titulo"), t("mensajes"), t("nombreUnidad"), t("correo")];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        user.title?.toLowerCase().includes(filterLower) ||
        user.textmessage?.toLowerCase().includes(filterLower) ||
        user.nameUnit?.toLowerCase().includes(filterLower) ||
        user.mailAdmin?.toLowerCase().includes(filterLower)
      );
    })
    .map((user, index) => [
      user.title || "",
      <div key={index}>
        <span className={!expandedRows[index] ? "line-clamp-3" : ""}>
          {user.textmessage}
        </span>{" "}
        <button
          onClick={() => toggleExpand(index)}
          className="text-blue-500 hover:underline text-sm"
        >
          {!expandedRows[index] ? t("vermas") : t("vermenos")}
        </button>
      </div>,
      user.nameUnit || "",
      user.mailAdmin || "",
    ]);

  const cellClasses = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

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
        cellClasses={cellClasses}
        borderColor="Text-gray-500"
        columnWidths={[
          "15%",
          "40%", // más espacio para mensajes
          "20%",
          "25%",
        ]}
      />
    </div>
  );
}
