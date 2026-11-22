"use client";

import { Modal, Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import React from "react";

interface Props {
  isOpen: boolean;
  /** "$11.781" con IVA, o null si todavía no se sabe. */
  price: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Activar el video subido en Básico y Oro. No cobra nada aquí: el video se
 * paga al publicar, junto con la publicación, y se muestra antes de pagar.
 */
export default function ModalActivateVideo({
  isOpen,
  price,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activar video">
      <div className="flex flex-col gap-6 px-2">
        <Text size="sm">
          Al activarlo podrás subir un video de tu propiedad (MP4, hasta 25 MB).
          <Text size="sm" className="mt-4" colVariant="primary">
            {price
              ? `El video cuesta ${price} con IVA, una sola vez por publicación. Se cobra al publicar.`
              : "El video tiene un costo adicional, una sola vez por publicación. Se cobra al publicar."}
          </Text>
          <Text size="sm" className="mt-2 text-gray-600">
            El enlace de YouTube o Vimeo es gratis, y en el plan Platino el video
            viene incluido.
          </Text>
        </Text>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button colVariant="none" onClick={onClose} className="px-4 py-2">
            Cancelar
          </Button>

          <Button colVariant="success" onClick={onConfirm} className="px-5 py-2">
            Activar video
          </Button>
        </div>
      </div>
    </Modal>
  );
}
