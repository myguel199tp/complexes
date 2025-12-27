import { Modal, Button, Text } from "complexes-next-components";
import React from "react";
import { usePublishHolliday } from "./mutation-publish";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

export default function ModalPublish({ isOpen, onClose, hollidayId }: Props) {
  const { mutate, isPending } = usePublishHolliday();

  const handlePublish = () => {
    mutate(hollidayId, {
      onSuccess: () => {
        onClose();
        // aquí puedes refetch o redirect
        alert("Inmueble publicado correctamente");
      },
      onError: (error: any) => {
        alert(error.message || "No se pudo publicar");
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar inmueble">
      <Text size="sm" className="mb-4">
        Al publicar este inmueble será visible para todos los usuarios. ¿Deseas
        continuar?
      </Text>

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>

        <Button onClick={handlePublish}>Publicar</Button>
      </div>
    </Modal>
  );
}
