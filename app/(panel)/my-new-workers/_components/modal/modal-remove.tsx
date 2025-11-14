"use client";

import React from "react";
import { Modal, Text, Button } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  onDelete: (userId: string) => void;
  title?: string;
}

export default function ModalRemove({
  isOpen,
  onClose,
  selectedUser,
  onDelete,
  title = "Eliminar propietario",
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[600px] h-auto"
    >
      {selectedUser ? (
        <div className="space-y-2">
          <Text size="lg" font="semi">
            {t("confirmacionEliminar") ||
              "¿Estás seguro de eliminar el propietario de la unidad residencial?"}
          </Text>

          <Text size="md">
            <Text as="span" font="semi">
              {t("nombre")}:
            </Text>{" "}
            {selectedUser.user.name}
          </Text>

          <Text size="md">
            <Text as="span" font="semi">
              {t("apellido")}:
            </Text>{" "}
            {selectedUser.user.lastName}
          </Text>

          <Text size="md">
            <Text as="span" font="semi">
              {t("torre")}:
            </Text>{" "}
            {selectedUser.tower}
          </Text>

          <Text size="md">
            <Text as="span" font="semi">
              {t("numeroInmuebleResidencial")}:
            </Text>{" "}
            {selectedUser.apartment}
          </Text>

          <Text size="md">
            <Text as="span" font="semi">
              {t("numeroPlaca")}:
            </Text>{" "}
            {selectedUser.plaque}
          </Text>

          <Button
            size="full"
            colVariant="danger"
            onClick={() => onDelete(selectedUser.user.id)}
          >
            {t("eliminar") || "Eliminar"}
          </Button>
        </div>
      ) : (
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
