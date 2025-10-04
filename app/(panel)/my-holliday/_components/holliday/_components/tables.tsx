"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { holllidayInfoService } from "../../../services/hollidayInfoService";
import { HollidayInfoResponses } from "../../../services/response/holllidayInfoResponse";

export default function Tables() {
  const [data, setData] = useState<HollidayInfoResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await holllidayInfoService();
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
    "Fecha inicio",
    "Fecha final",
  ];

  const filteredRows = data
    ?.filter((user) => {
      const filterLower = filterText?.toLowerCase();
      return (
        user.property?.toLowerCase().includes(filterLower) ||
        user.country?.toLowerCase().includes(filterLower) ||
        user.city?.toLowerCase().includes(filterLower) ||
        user.neigborhood?.toLowerCase().includes(filterLower) ||
        user.address?.toLowerCase().includes(filterLower) ||
        user.price?.toLowerCase().includes(filterLower) ||
        user.startDate?.toLowerCase().includes(filterLower) ||
        user.endDate?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.property || "",
      user.country || "",
      user.city || "",
      user.neigborhood || "",
      user.address || "",
      user.price || "",
      user.startDate || "",
      user.endDate || "",
    ]);

  const cellClasses = [["", "", "", "", "", "", "", ""]];

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
        columnWidths={["11%", "11%", "11%", "11%", "11%", "11%", "11%", "11%"]}
      />
    </div>
  );
}
