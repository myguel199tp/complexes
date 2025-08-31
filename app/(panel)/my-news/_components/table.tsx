"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allNewsService } from "../services/newsAllServices";
import { NewsResponse } from "../services/response/newsResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function Tables() {
  const [data, setData] = useState<NewsResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  useEffect(() => {
    if (!conjuntoId) return; // evitar llamadas con conjuntoId vacío

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

  const headers = ["titulo", "Mensaje", "nombre unidad", "correo"];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText.toLowerCase();
      return (
        user.title?.toLowerCase().includes(filterLower) ||
        user.textmessage?.toLowerCase().includes(filterLower) ||
        user.nameUnit?.toLowerCase().includes(filterLower) ||
        user.mailAdmin?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.title || "",
      user.textmessage || "",
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
      <InputField
        placeholder="Buscar"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mt-4 p-4"
      />
      <Table
        headers={headers}
        rows={filteredRows}
        cellClasses={cellClasses}
        columnWidths={[
          "15%",
          "15%",
          "15%",
          "20%",
          "10%",
          "10%",
          "10%",
          "10%",
          "10%",
        ]}
      />
    </div>
  );
}
