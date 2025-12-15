import { Modal } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalRemove({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar actividad">
      <div>Eliminar</div>
    </Modal>
  );
}
