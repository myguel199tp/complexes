"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { allNewsService } from "../services/newsAllServices";
import { NewsResponse } from "../services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useTranslation } from "react-i18next";
import MessageNotData from "@/app/components/messageNotData";
import { useLanguage } from "@/app/hooks/useLanguage";
import MessageNotConnect from "@/app/components/messageNotInfo";

export default function Tables() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();
  const { language } = useLanguage();

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
    return <MessageNotConnect />;
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

  // ✅ Generar cellClasses con estilo igual al primer componente
  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700")
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
          columnWidths={["15%", "40%", "20%", "25%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
