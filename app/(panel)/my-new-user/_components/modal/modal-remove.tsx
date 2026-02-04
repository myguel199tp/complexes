"use client";

import React from "react";
import { Modal, Text, Button, Buton } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useLanguage } from "@/app/hooks/useLanguage";

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
  const { language } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-full max-w-lg"
    >
      {selectedUser ? (
        <div key={language} className="space-y-6">
          {/* Mensaje principal */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <Text size="md" font="semi" className="text-red-700">
              {t("confirmacionEliminar") ||
                "¿Estás seguro de que deseas eliminar este propietario?"}
            </Text>
            <Text size="sm" className="text-red-600 mt-1">
              Esta acción no se puede deshacer.
            </Text>
          </div>

          {/* Información del propietario */}
          <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
            <Text font="semi" size="sm">
              Información del propietario
            </Text>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Text size="sm" as="span" font="semi">
                  {t("nombre")}:
                </Text>{" "}
                {selectedUser.user.name}
              </div>

              <div>
                <Text size="sm" as="span" font="semi">
                  {t("apellido")}:
                </Text>{" "}
                {selectedUser.user.lastName}
              </div>

              <div>
                <Text size="sm" as="span" font="semi">
                  {t("torre")}:
                </Text>{" "}
                {selectedUser.tower}
              </div>

              <div>
                <Text size="sm" as="span" font="semi">
                  {t("numeroInmuebleResidencial")}:
                </Text>{" "}
                {selectedUser.apartment}
              </div>

              <div className="col-span-2">
                <Text size="sm" as="span" font="semi">
                  {t("numeroPlaca")}:
                </Text>{" "}
                {selectedUser.plaque}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Buton colVariant="none" borderWidth="none" onClick={onClose}>
              {t("cancelar") || "Cancelar"}
            </Buton>

            <Button
              colVariant="danger"
              onClick={() => onDelete(selectedUser.user.id)}
            >
              {t("eliminar") || "Eliminar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center">
          <Text size="md" className="text-gray-500">
            {t("noSeleccionado") || "No hay propietario seleccionado"}
          </Text>
        </div>
      )}
    </Modal>
  );
}
