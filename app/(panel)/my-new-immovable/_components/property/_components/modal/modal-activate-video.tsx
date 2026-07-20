"use client";

import { Buton, Button, Modal, Text } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalActivateVideo({
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activar video">
      <div className="flex flex-col gap-6 px-2">
        <Text size="sm">
          Al activar esta opción podrás subir un video de tu propiedad o agregar
          un enlace de YouTube.
          <Text size="sm" className="mt-4" colVariant="primary">
            Ten en cuenta que el video tiene un costo adicional sobre tu
            publicación.
          </Text>
        </Text>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Buton
            colVariant="none"
            borderWidth="none"
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancelar
          </Buton>

          <Button
            colVariant="success"
            onClick={onConfirm}
            className="px-5 py-2"
          >
            Activar video
          </Button>
        </div>
      </div>
    </Modal>
  );
}
