import { Modal } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modaledit({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar propiedad">
      <div>EDITAR</div>
    </Modal>
  );
}
