import { Modal, Title, Text, Button } from "complexes-next-components";
import React from "react";
import { Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ModalRemove({ isOpen, onClose, onConfirm }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      className="w-full max-w-md p-6 rounded-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <Trash2 className="text-red-600 mb-3" size={40} />

        <Title as="h2" className="text-lg font-bold">
          ¿Eliminar certificación?
        </Title>

        <Text size="sm" className="text-gray-600 mt-2">
          Esta acción no se puede deshacer.
        </Text>

        <div className="flex gap-3 mt-6 w-full">
          <Button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
