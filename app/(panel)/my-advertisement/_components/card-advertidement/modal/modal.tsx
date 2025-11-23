import { Modal } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalProducts({ isOpen, onClose }: Props) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="w-full h-auto md:!w-[1700px] md:!h-[850px] max-h-[95vh]"
      >
        <div>hola </div>
      </Modal>
    </>
  );
}
