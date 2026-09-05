"use client";

import React from "react";
import {
  Badge,
  InputField,
  Table,
  Text,
  Button,
} from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useTableInfo } from "./table-info";
import MessageNotData from "@/app/components/messageNotData";
import { useAwaitingEntry, useEnterVisitMutation } from "./use-awaiting-entry";
import ParkingChargeModal from "./parking-charge-modal";

export default function TablesIns() {
  const {
    error,
    isLoading,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    t,
    language,

    // modal
    openModal,
    selectedVisit,
    handleCloseModal,
  } = useTableInfo();

  const { data: awaitingEntry = [] } = useAwaitingEntry();
  const { mutate: enterVisit, isPending: isEntering } = useEnterVisitMutation();

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
      {/* total */}
      <div className="flex gap-4">
        <Badge background="primary" size="xs" rounded="lg">
          Visitante {filteredRows.length}
        </Badge>
      </div>

      {/* autorizados que todavía no han cruzado la reja */}
      {awaitingEntry.length > 0 && (
        <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-50/60 p-3">
          <Text size="sm" font="bold" className="mb-2">
            Autorizados esperando ingreso ({awaitingEntry.length})
          </Text>

          <div className="flex flex-col gap-2">
            {awaitingEntry.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2"
              >
                <Text size="sm">
                  <strong>{visit.namevisit}</strong> — Apto {visit.apartment}
                  {visit.plaque ? ` — ${visit.plaque}` : ""}
                </Text>

                <Button
                  size="sm"
                  colVariant="success"
                  disabled={isEntering}
                  onClick={() => enterVisit(visit.id)}
                >
                  {isEntering ? "Registrando..." : "Registrar ingreso"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* buscador */}
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
        <Table
          headers={headers}
          rows={filteredRows}
          borderColor="Text-gray-500"
          cellClasses={cellClasses}
          columnWidths={["16%", "12%", "12%", "10%", "14%", "12%", "12%", "12%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}

      {/*
        La salida dejó de ser solo una confirmación: si el visitante debe el
        parqueadero, aquí es donde se le cobra antes de abrirle la reja.
      */}
      <ParkingChargeModal
        visit={selectedVisit}
        isOpen={openModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
