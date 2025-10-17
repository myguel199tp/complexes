"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useState } from "react";
import useInfoPqr from "./useInfoPqr";

export default function Tables() {
  const { data, error } = useInfoPqr();
  const [filterText, setFilterText] = useState("");

  if (error) {
    return <div>{error}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No hay registros disponibles.</div>;
  }

  // ✅ Cabeceras para la tabla
  const headers = ["Tipo", "Radicado", "Torre", "Apartamento", "Archivo PDF"];

  // ✅ Filtrado por texto (opcional, busca por tipo o descripción)
  const filteredRows = data
    .filter(
      (pqr) =>
        pqr.type.toLowerCase().includes(filterText.toLowerCase()) ||
        pqr.description.toLowerCase().includes(filterText.toLowerCase())
    )
    .map((pqr) => [
      pqr.type || "",
      pqr.radicado || "",
      pqr.tower || "",
      pqr.apartment || "",
      pqr.file ? (
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/${pqr.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Ver PDF
        </a>
      ) : (
        "Sin archivo"
      ),
    ]);

  return (
    <div className="w-full p-4">
      <InputField
        placeholder="Buscar por tipo o descripción"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mt-4 p-4"
      />

      <Table
        headers={headers}
        rows={filteredRows}
        columnWidths={["10%", "10%", "30%", "10%", "10%", "15%", "15%"]}
      />
    </div>
  );
}
