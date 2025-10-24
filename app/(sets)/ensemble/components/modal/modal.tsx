import { Modal, Title, Text, Button } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalWelcome({ isOpen, onClose }: Props) {
  const recommendations = [
    {
      name: "Parque Central",
      description:
        "Perfecto para caminar, relajarte y disfrutar del ambiente local.",
    },
    {
      name: "Restaurante El Encanto",
      description:
        "Prueba los sabores típicos de la región en un ambiente acogedor.",
    },
    {
      name: "Museo de la Ciudad",
      description:
        "Descubre la historia y cultura local en una experiencia única.",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[1000px] h-auto max-h-[95vh]"
    >
      <div className="p-6 text-center">
        <Title size="lg" className="mb-4" font="bold">
          ¡Bienvenido a tu estancia!
        </Title>
        <Text size="lg" className="text-gray-700 mb-6">
          Nos alegra tenerte con nosotros. Esperamos que disfrutes tu tiempo
          aquí y te sientas como en casa.
        </Text>

        <Text size="lg" font="bold" className="mb-4">
          Te recomendamos visitar:
        </Text>

        <div className="grid gap-4 mb-6 sm:grid-cols-2">
          {recommendations.map((place, index) => (
            <div key={index} className="p-4 text-left">
              <Title size="sm" className="mb-2">
                {place.name}
              </Title>
              <Text size="sm" className="text-gray-600">
                {place.description}
              </Text>
            </div>
          ))}
        </div>

        <Button colVariant="primary" rounded="lg" onClick={onClose}>
          ¡Comenzar mi estadía!
        </Button>
      </div>
    </Modal>
  );
}
