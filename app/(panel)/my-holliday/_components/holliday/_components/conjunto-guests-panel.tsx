"use client";

import React, { useState } from "react";
import { Table, Title, Text } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { IoSearchCircle } from "react-icons/io5";
import { InputField } from "complexes-next-components";
import { useConjuntoGuestsQuery } from "./use-conjunto-guests-query";

const formatDate = (dateStr: string): string =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

export default function ConjuntoGuestsPanel() {
  const { data = [], isLoading, error } = useConjuntoGuestsQuery();
  const [filterText, setFilterText] = useState("");

  const headers = [
    "Inmueble",
    "Unidad / Torre / Apto",
    "Huésped",
    "Contacto",
    "Documento",
    "Estadía",
    "Pasajeros",
  ];

  const filtered = data.filter((item) => {
    const q = filterText.toLowerCase();
    return (
      item.inmueble?.nombre?.toLowerCase().includes(q) ||
      item.inmueble?.unidad?.toLowerCase().includes(q) ||
      item.inmueble?.torre?.toLowerCase().includes(q) ||
      item.huesped?.nombre?.toLowerCase().includes(q) ||
      item.huesped?.documento?.toLowerCase().includes(q)
    );
  });

  const rows = filtered.map((item) => [
    item.inmueble?.nombre || "-",
    `${item.inmueble?.unidad || "-"} / ${item.inmueble?.torre || "-"} / ${
      item.inmueble?.apartamento || "-"
    }`,
    item.huesped?.nombre || "-",
    `${item.huesped?.telefono || "-"} · ${item.huesped?.email || "-"}`,
    item.huesped?.documento || "-",
    `${formatDate(item.fechas?.entrada)} → ${formatDate(item.fechas?.salida)}`,
    String(item.pasajeros ?? 0),
  ]);

  return (
    <div className="w-full p-4">
      <Title size="sm" font="bold" colVariant="on">
        Huéspedes actualmente en el conjunto
      </Title>
      <Text size="sm" className="text-gray-500 mb-3">
        Reservas confirmadas cuyo rango incluye el día de hoy.
      </Text>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <ImSpinner9 className="animate-spin text-cyan-800" size={36} />
        </div>
      ) : error ? (
        <div className="text-red-500 py-6">
          No pudimos cargar los huéspedes del conjunto.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 py-6 text-center">
          No hay huéspedes dentro del conjunto hoy.
        </div>
      ) : (
        <>
          <InputField
            placeholder="Buscar"
            helpText="Buscar por inmueble, huésped o documento"
            value={filterText}
            prefixElement={<IoSearchCircle />}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            onChange={(e) => setFilterText(e.target.value)}
            className="mb-3"
          />
          <Table
            headers={headers}
            rows={rows}
            sizeText="sm"
            size="sm"
            fontText="bold"
            colVariant="primary"
            borderColor="text-gray-500"
            columnWidths={["16%", "18%", "14%", "20%", "12%", "14%", "6%"]}
          />
        </>
      )}
    </div>
  );
}
