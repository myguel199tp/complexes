"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { inmovableInfoService } from "../services/newInmovableinfoService";
import { InmovableinfoResponses } from "../services/response/inmovableInfoResponse";

export default function Tables() {
  const [data, setData] = useState<InmovableinfoResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await inmovableInfoService();
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
    "tipo",
    "País",
    "Ciudad",
    "Sector",
    "Dirección",
    "Precio",
    "Teléfono",
  ];

  const filteredRows = data
    ?.filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        user.property?.toLowerCase().includes(filterLower) ||
        user.country?.toLowerCase().includes(filterLower) ||
        user.city?.toLowerCase().includes(filterLower) ||
        user.neighborhood?.toLowerCase().includes(filterLower) ||
        user.address?.toLowerCase().includes(filterLower) ||
        user.price?.toLowerCase().includes(filterLower) ||
        user.phone?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.property || "",
      user.country || "",
      user.city || "",
      user.neighborhood || "",
      user.address || "",
      user.price || "",
      user.phone || "",
    ]);

  const cellClasses = [["", "", "", "", "", "", ""]];

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
        columnWidths={["14%", "14%", "14%", "14%", "14%", "14%", "14%"]}
      />
    </div>
  );
}
