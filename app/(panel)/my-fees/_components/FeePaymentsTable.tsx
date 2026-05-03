"use client";

import React, { useState } from "react";
import { Table, InputField, Badge } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import useFeePaymentsTable from "./useActivitTable";
import { useGenerateFeesMutation } from "./use-generate-fees-mutation";
import { ConjuntoBankAccount } from "../services/bankUnitService";

// 👇 tipado de cuenta bancaria

export default function FeePaymentsTable() {
  const { data, error, filterText, setFilterText, bank } =
    useFeePaymentsTable();

  const { mutate: generateFees, isPending } = useGenerateFeesMutation();

  const [showBankInfo, setShowBankInfo] = useState(false);

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    "Fecha inicio",
    "Monto",
    "Moneda",
    "Tipo",
    "Frecuencia",
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
    .map((item) => [
      item.lastPaymentDate
        ? new Date(item.lastPaymentDate).toLocaleDateString()
        : "-",

      item.amount ?? "-",

      item.currency ?? "-",

      item.feeType ?? "-",

      item.recommendedSchedule ?? "-",

      item.digitalPaymentEnabled ? "Sí" : "No",

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

      item.showMessageDaysBefore ?? "-",

      item.feeType === "Cuotas extraordinarias"
        ? item.specificMonths?.join(", ") || "-"
        : `${item.monthsToGenerate ?? "-"} meses`,

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
      {/* 🔎 Buscador */}
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

      {/* 🏦 Cuenta bancaria */}
      <div className="mt-4">
        <button onClick={() => setShowBankInfo((prev) => !prev)}>
          <Badge size="sm" colVariant="primary" rounded="lg">
            Cuenta de banco {showBankInfo ? "▲" : "▼"}
          </Badge>
        </button>

        {showBankInfo && (
          <div className="absolute z-50 mt-2 p-4 border rounded-lg bg-white shadow-lg w-full md:w-[400px]">
            {" "}
            {bank && bank.length > 0 ? (
              (bank as ConjuntoBankAccount[]).map((b) => (
                <div key={b.id} className="mb-4 text-sm text-gray-700">
                  <p>
                    <strong>Banco:</strong> {b.bankName}
                  </p>
                  <p>
                    <strong>Número:</strong> {b.accountNumber}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {b.accountType}
                  </p>
                  <p>
                    <strong>Estado:</strong> {b.isActive}
                  </p>

                  <div className="flex gap-2 mt-2">
                    {b.isPrimary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>

                  <hr className="mt-3" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No hay cuentas registradas
              </p>
            )}
          </div>
        )}
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
