"use client";

import React from "react";
import { Badge, InputField, Table, Text } from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useTableInfo } from "./table-info";
import MessageNotData from "@/app/components/messageNotData";

export default function Tables() {
  const {
    error,
    isLoading,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    total,
    page,
    totalPages,
    setPage,
    t,
    language,
  } = useTableInfo();

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  if (isLoading) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        {t("cargando") || "Cargando..."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error instanceof Error ? error.message : "Error inesperado"}
      </div>
    );
  }

  return (
    <div key={language} className="w-full p-4">
      <div className="flex gap-4">
        <Badge background="primary" size="sm" rounded="lg" role="contentinfo">
          {t("registrosTotales")}:{" "}
          <Text as="span" size="sm" font="bold">
            {/* El total lo cuenta el servidor; `filteredRows` es solo la página. */}
            {total}
          </Text>
        </Badge>
      </div>

      <div className="flex gap-4 mt-4 w-full">
        <InputField
          regexType="safeChars"
          placeholder={t("buscarNoticia")}
          helpText={t("buscarNoticia")}
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          sizeHelp="sm"
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {filteredRows.length > 0 ? (
        <>
          <Table
            headers={headers}
            rows={filteredRows}
            borderColor="Text-gray-500"
            cellClasses={cellClasses}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                className="px-3 py-1 rounded border disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>

              <Text colVariant="on" size="sm">
                Página {page} de {totalPages}
              </Text>

              <button
                className="px-3 py-1 rounded border disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}
    </div>
  );
}
