"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allVisitService } from "../../services/citofonieAllService";
import { VisitResponse } from "../../services/response/VisitResponse";

export default function Tables() {
  const [data, setData] = useState<VisitResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allVisitService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const headers = [
    "Nombre del visitabte",
    "Casa o apartamento",
    "Placa",
    "Hora ingreso",
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText.toLowerCase();
      return (
        user.namevisit?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower) ||
        user.startHour?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.namevisit || "",
      user.apartment || "",
      user.plaque || "",
      user.startHour || "",
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
