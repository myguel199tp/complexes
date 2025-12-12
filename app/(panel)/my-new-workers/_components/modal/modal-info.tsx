"use client";

import React from "react";
import { Modal, Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useLanguage } from "@/app/hooks/useLanguage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  title?: string;
}

export default function ModalInfo({
  isOpen,
  onClose,
  selectedUser,
  title = "Información del propietario",
}: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[600px] h-auto"
    >
      {selectedUser ? (
        <div key={language} className="space-y-2">
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
        </div>
      ) : (
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      )}
    </Modal>
  );
}
