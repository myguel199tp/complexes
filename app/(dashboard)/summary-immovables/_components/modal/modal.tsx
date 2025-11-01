import { Button, InputField, Modal } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSummary({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <InputField placeholder="Nombre y apellido" className="mt-2" />
        <InputField placeholder="Indicativo" className="mt-2" />
        <InputField placeholder="Celular" className="mt-2" />
        <Button>Guardar</Button>
      </div>
    </Modal>
  );
}
