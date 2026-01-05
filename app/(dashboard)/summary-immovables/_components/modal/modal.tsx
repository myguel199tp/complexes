import { Button, InputField, Modal, Text } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalSummary({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Déjanos tus datos de contacto"
    >
      <div className="p-4 space-y-4">
        {/* Explicación */}
        <Text size="sm" className="text-gray-600">
          Completa el siguiente formulario para que nuestro equipo pueda
          contactarte, resolver tus dudas y continuar con el proceso de la
          reserva.
          <br />
          <strong>No realizaremos ningún cobro en este paso.</strong>
        </Text>

        {/* Formulario */}
        <div className="space-y-3">
          <InputField placeholder="Nombre y apellido" label="Nombre completo" />

          <InputField placeholder="+57" label="Indicativo del país" />

          <InputField
            placeholder="Ej: 300 123 4567"
            label="Número de celular"
          />
        </div>

        {/* CTA */}
        <Button className="w-full mt-4">Guardar y solicitar contacto</Button>

        {/* Texto de confianza */}
        <Text size="xs" className="text-gray-500 text-center">
          Usaremos esta información únicamente para contactarte sobre tu
          solicitud.
        </Text>
      </div>
    </Modal>
  );
}
