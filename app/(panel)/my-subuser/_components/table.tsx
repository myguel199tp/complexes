"use client";

import { InputField, Table } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { allUserService } from "../services/usersService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

export default function Tables() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [filterText, setFilterText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!conjuntoId) return; // Evita llamar si todavía no existe

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await allUserService(String(conjuntoId));
        setData(result);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conjuntoId]);

  if (loading) return <div>Cargando...</div>;

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
      const filterLower = filterText?.toLowerCase();
      return (
        user.conjunto.id?.toLowerCase().includes(filterLower) ||
        user.plaque?.toLowerCase().includes(filterLower)
      );
    })
    .map((user) => [
      // user.name || "",
      // user.lastName || "",
      // user.phone || "",
      // user.email || "",
      // user.numberid || "",
      // user.country || "",
      // user.city || "",
      // user.neigborhood || "",
      // user.nameUnit || "",
      user.apartment || "",
      user.plaque || "",
    ]);

  const cellClasses = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];

  return (
    <div className="p-4 w-[1200px] bg-red-500">
      <InputField
        placeholder="Buscar"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="mt-4 mb-4"
      />

      <Table
        className="overflow-y-auto"
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
