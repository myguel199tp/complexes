import { Modal, Title, Text, Button } from "complexes-next-components";
import React from "react";
import { Pencil } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
}

export default function ModalEdit({ isOpen, onClose, item }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      className="w-full max-w-2xl p-6 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Pencil className="text-blue-600" size={22} />
        <Title as="h2" className="text-xl font-bold">
          Editar Certificación
        </Title>
      </div>

      <Text size="sm" className="text-gray-600 mb-6">
        Aquí puedes modificar la información de la certificación.
      </Text>

      {/* Aquí iría tu formulario */}

      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancelar
        </Button>

        <Button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Guardar cambios
        </Button>
      </div>
    </Modal>
  );
}
