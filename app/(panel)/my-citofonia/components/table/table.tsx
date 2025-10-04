"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allVisitService } from "../../services/citofonieAllService";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { IoSearchCircle } from "react-icons/io5";
import { useTranslation } from "react-i18next";

export default function Tables() {
  const [data, setData] = useState<VisitResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { t } = useTranslation();

  useEffect(() => {
    if (!conjuntoId) return; // evitar llamadas con conjuntoId vacío

    const fetchData = async () => {
      try {
        const result = await allVisitService(conjuntoId);
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

  const headers = [
    t("nombreVisistante"),
    t("numeroInmuebleResidencial"),
    t("numeroPlaca"),
    t("tipovisitante"),
    t("horaIngreso"),
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        user.namevisit?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower) ||
        user.visitType?.toLowerCase().includes(filterLower) ||
        user.created_at?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.namevisit || "",
      user.apartment || "",
      user.plaque || "",
      user.visitType || "",
      user.created_at
        ? new Date(user.created_at).toLocaleString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // si quieres formato 24h
          })
        : "",
    ]);

  const cellClasses = [
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
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
        borderColor="Text-gray-500"
        cellClasses={cellClasses}
        columnWidths={["15%", "15%", "15%", "15%"]}
      />
    </div>
  );
}
