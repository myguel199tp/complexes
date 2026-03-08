"use client";

import React, { useState } from "react";
import { InputField, Table } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useInfoExpenseQuery } from "./expense-query";
import MessageNotData from "@/app/components/messageNotData";
import { ExpenseResponse } from "../../services/response/expenseResponse";

export default function Tables() {
  const { data = [], error } = useInfoExpenseQuery();

  const [filterText, setFilterText] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    "Concepto",
    "Categoría",
    "Monto",
    "Fecha de pago",
    "Periodo",
    "Observaciones",
  ];

  const filteredRows = data
    .filter((expense: ExpenseResponse) => {
      const filterLower = filterText.toLowerCase();

      return (
        expense.concept?.toLowerCase().includes(filterLower) ||
        expense.category?.name?.toLowerCase().includes(filterLower) ||
        expense.amount?.toLowerCase().includes(filterLower) ||
        expense.paymentDate?.toLowerCase().includes(filterLower) ||
        expense.period?.toLowerCase().includes(filterLower) ||
        expense.observations?.toLowerCase().includes(filterLower)
      );
    })
    .map((expense: ExpenseResponse, index: number) => [
      expense.concept || "",
      expense.category?.name || "",
      expense.amount || "",
      expense.paymentDate || "",
      expense.period || "",

      <div key={expense.id} className="text-sm text-gray-700">
        <span className={!expandedRows[index] ? "line-clamp-3" : ""}>
          {expense.observations || ""}
        </span>

        {expense.observations && expense.observations.length > 100 && (
          <button
            onClick={() => toggleExpand(index)}
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            {!expandedRows[index] ? "Ver más" : "Ver menos"}
          </button>
        )}
      </div>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div className="w-full p-4">
      {/* 🔍 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder="Buscar gasto..."
          helpText="Buscar gasto"
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* 📋 Tabla */}
      {filteredRows.length > 0 ? (
        <Table
          headers={headers}
          rows={filteredRows}
          borderColor="text-gray-500"
          cellClasses={cellClasses}
          columnWidths={["18%", "18%", "12%", "15%", "12%", "25%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
