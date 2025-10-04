import { Modal, Text } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPay({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Datos de pago">
      <div>
        <Text>
          Por favor, ingresa los datos donde deseas recibir el pago. Ten en
          cuenta que el pago se realizará una vez que el huésped haya ocupado el
          inmueble.
        </Text>
        <Text>
          Los costos asociados a la transacción se descontarán del monto total.
        </Text>
      </div>
    </Modal>
  );
}
