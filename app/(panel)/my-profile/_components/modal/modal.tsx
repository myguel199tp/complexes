import { useLanguage } from "@/app/hooks/useLanguage";
import { Flag, Modal, Text } from "complexes-next-components";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAdmin({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <Modal className="w-[730px] h-auto z-50" isOpen={isOpen} onClose={onClose}>
      <div key={language}>
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
      </div>
    </Modal>
  );
}
