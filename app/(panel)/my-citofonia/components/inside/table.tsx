"use client";

import React from "react";
import {
  Badge,
  InputField,
  Table,
  Text,
  Modal,
  Button,
} from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { useTableInfo } from "./table-info";
import MessageNotData from "@/app/components/messageNotData";
import { useExitVisitMutation } from "./use-exit-visit-mutation";

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

  const { mutate: exitVisit, isPending } = useExitVisitMutation();

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

  const handleConfirmExit = () => {
    if (!selectedVisit) return;

    exitVisit(
      {
        id: selectedVisit.id,
      },
      {
        onSuccess: () => {
          handleCloseModal();
        },
      },
    );
  };

  return (
    <div key={language} className="w-full p-4">
      {/* total */}
      <div className="flex gap-4">
        <Badge background="primary" size="xs" rounded="lg">
          Visitante {filteredRows.length}
        </Badge>
      </div>

      {/* buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
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
          columnWidths={["14%", "14%", "14%", "14%", "14%", "15%", "15%"]}
        />
      ) : (
        <div className="text-center py-10 text-gray-500">
          <MessageNotData />
        </div>
      )}

      <Modal
        isOpen={openModal}
        title="Cerrar visita"
        onClose={handleCloseModal}
      >
        <div className="p-6">
          <Text className="mb-6">
            ¿Seguro que deseas cerrar la visita de{" "}
            <strong>{selectedVisit?.namevisit}</strong>?
          </Text>

          <div className="flex justify-end gap-3">
            <Button onClick={handleCloseModal}>
              {t("cancelar") || "Cancelar"}
            </Button>

            <Button disabled={isPending} onClick={handleConfirmExit}>
              {isPending ? "Cerrando..." : t("confirmar") || "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
