"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { addInfoService } from "../services/addInfoServices";
import { AddResponses } from "../services/response/addResponse";

export default function Tables() {
  const [data, setData] = useState<AddResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await addInfoService();
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

  const headers = ["Nombre empresa", "profesion", "pagina web"];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        user.profession?.toLowerCase().includes(filterLower) ||
        user.name?.toLowerCase().includes(filterLower) ||
        user.webPage?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.profession || "",
      user.name || "",
      user.webPage || "",
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
        columnWidths={["20%", "20%", "15%"]}
      />
    </div>
  );
}
