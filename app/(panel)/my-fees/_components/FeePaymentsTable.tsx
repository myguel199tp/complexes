"use client";

import React, { useState } from "react";
import { Table, InputField } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import useFeePaymentsTable from "./useActivitTable";
import { useGenerateFeesMutation } from "./use-generate-fees-mutation";

export default function FeePaymentsTable() {
  const { data, error, filterText, setFilterText } = useFeePaymentsTable();
  const { mutate: generateFees, isPending } = useGenerateFeesMutation();
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    "Fecha inicio",
    "Monto",
    "Moneda",
    "Tipo",
    "Frecuencia",
    "Lugares de pago",
    "Pago digital",
    "URL pago",
    "Días aviso",
    "Generación",
    "Creado",
    "Acciones",
  ];

  const filteredRows = data
    .filter((item) => {
      const text = filterText.toLowerCase();

      return (
        String(item.currency).toLowerCase().includes(text) ||
        String(item.recommendedSchedule).toLowerCase().includes(text) ||
        String(item.feeType).toLowerCase().includes(text)
      );
    })
    .map((item, index) => [
      // 📅 Fecha inicio
      item.lastPaymentDate
        ? new Date(item.lastPaymentDate).toLocaleDateString()
        : "-",

      // 💰 Monto
      item.amount ?? "-",

      // 💱 Moneda
      item.currency ?? "-",

      // 🧾 Tipo
      item.feeType ?? "-",

      // 🔁 Frecuencia
      item.recommendedSchedule ?? "-",

      // 🏦 Lugares de pago (expandible)
      <div key={`places-${index}`} className="text-sm">
        <span className={!expandedRows[index] ? "line-clamp-2" : ""}>
          {item.paymentPlaces?.join(", ") || "-"}
        </span>

        {item.paymentPlaces?.length > 2 && (
          <button
            onClick={() => toggleExpand(index)}
            className="ml-2 text-blue-600 hover:underline"
          >
            {expandedRows[index] ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>,

      // 💳 Pago digital
      item.digitalPaymentEnabled ? "Sí" : "No",

      // 🔗 URL pago
      item.digitalPaymentUrl ? (
        <a
          href={item.digitalPaymentUrl}
          target="_blank"
          className="text-blue-600 underline"
        >
          Ver link
        </a>
      ) : (
        "-"
      ),

      // ⏰ Días aviso
      item.showMessageDaysBefore ?? "-",

      // ⚙️ Generación (clave 🔥)
      item.feeType === "Cuotas extraordinarias"
        ? item.specificMonths?.join(", ") || "-"
        : `${item.monthsToGenerate ?? "-"} meses`,

      // 🕒 Creado
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
      <button
        key={`generate-${item.id}`}
        onClick={() => generateFees(item.id)}
        disabled={isPending}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Generando..." : "Generar"}
      </button>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div className="w-full p-4">
      {/* 🔍 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder="Buscar configuración..."
          helpText="Buscar"
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* 📊 Tabla */}
      <Table
        headers={headers}
        rows={filteredRows}
        cellClasses={cellClasses}
        columnWidths={[
          "10%",
          "10%",
          "8%",
          "15%",
          "10%",
          "15%",
          "8%",
          "10%",
          "7%",
          "12%",
          "10%",
          "10%",
        ]}
      />
    </div>
  );
}
