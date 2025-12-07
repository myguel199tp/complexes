import { Flag, Modal, Text } from "complexes-next-components";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAdmin({ isOpen, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal className="w-[730px] h-auto z-50" isOpen={isOpen} onClose={onClose}>
      <Flag background="warning">
        <Text tKey={t("mensajenopago")} size="md" font="bold" />
        <Text tKey={t("pagonomensaje")} size="md" className="mt-4" />
        <Text tKey={t("graciasMensaje")} size="md" className="mt-4" />
        <Text
          tKey={t("Mensajeagradecimiento")}
          size="md"
          className="mt-4"
          font="bold"
        />
      </Flag>
    </Modal>
  );
}
