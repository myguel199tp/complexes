"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { UsersResponse } from "../services/response/usersResponse";
import { allUserService } from "../services/usersService";

export default function Tables() {
  const [data, setData] = useState<UsersResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await allUserService();
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
    "Nombre",
    "Apellido",
    "Celular",
    "Correo",
    "Cédula",
    "País",
    "Ciudad",
    "Barrio",
    "Unidad",
    "Apto",
    "Placa",
  ];

  const filteredRows = data
    .filter((user) => {
      const filterLower = filterText.toLowerCase();
      return (
        user.name?.toLowerCase().includes(filterLower) ||
        user.lastName?.toLowerCase().includes(filterLower) ||
        user.phone?.toLowerCase().includes(filterLower) ||
        user.email?.toLowerCase().includes(filterLower) ||
        user.numberid?.toLowerCase().includes(filterLower) ||
        user.country?.toLowerCase().includes(filterLower) ||
        user.city?.toLowerCase().includes(filterLower) ||
        user.neigborhood?.toLowerCase().includes(filterLower) ||
        user.nameUnit?.toLowerCase().includes(filterLower) ||
        user.apartment?.toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      user.name || "",
      user.lastName || "",
      user.phone || "",
      user.email || "",
      user.numberid || "",
      user.country || "",
      user.city || "",
      user.neigborhood || "",
      user.nameUnit || "",
      user.apartment || "",
      user.plaque || "",
    ]);

  const cellClasses = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  return (
    <div className="p-4 w-full">
      <InputField
        placeholder="Buscar"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mb-2"
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
