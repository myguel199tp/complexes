"use client";

import React from "react";
import { Modal, Text, Button } from "complexes-next-components";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  module: string;
  maxItems: number;
  canHighlight: boolean;
  prioritySearch: boolean;
  price: number;
  durationDays: number;
}

export default function PackageModal({
  isOpen,
  onClose,
  name,
  maxItems,
  price,
  durationDays,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprar paquete"
      className="w-full max-w-md rounded-xl shadow-lg"
    >
      <div className="flex flex-col gap-6 p-6">
        <Text className="text-gray-700 text-base">
          Estás a punto de adquirir el paquete:
        </Text>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <Text className="text-lg font-semibold text-blue-800">{name}</Text>

          <Text>
            Permite crear <strong>{maxItems}</strong> publicaciones durante{" "}
            <strong>{durationDays} días</strong>.
          </Text>

          <Text className="text-blue-900 font-bold text-lg">${price} COP</Text>
        </div>

        <Text>¿Está seguro de que desea continuar con la compra?</Text>

        <Button
          onClick={() => alert("Compra realizada")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2"
        >
          Comprar
        </Button>
      </div>
    </Modal>
  );
}
