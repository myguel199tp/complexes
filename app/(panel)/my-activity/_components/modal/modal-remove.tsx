"use client";

import { Buton, Button, Modal, Text } from "complexes-next-components";
import React from "react";
import { useMutationDeleteActivity } from "./mutation-delete-activity";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activity: string;
  id: string;
}

export default function ModalRemove({ isOpen, onClose, activity, id }: Props) {
  const { mutate, isPending } = useMutationDeleteActivity(id);

  const handleDelete = () => {
    mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar actividad">
      <div className="flex flex-col gap-6 px-2">
        {/* Texto */}
        <Text size="sm">
          ¿Está seguro de que desea eliminar la siguiente actividad?
          <Text size="sm" font="bold">
            {activity}
          </Text>
          <Text size="sm" className="mt-4" colVariant="primary">
            Esta acción no se puede deshacer.
          </Text>
        </Text>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Buton
            colVariant="none"
            borderWidth="none"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2"
          >
            Cancelar
          </Buton>

          <Button
            colVariant="danger"
            onClick={handleDelete}
            disabled={isPending}
            className="px-5 py-2"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
