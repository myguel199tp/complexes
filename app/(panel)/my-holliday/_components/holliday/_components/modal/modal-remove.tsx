import { Button, Modal, Text } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { removeHolliday } from "../../../../services/hollidayManageService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId?: string;
  hollidayName?: string;
  /** Recarga la tabla cuando el inmueble ya no está. */
  onRemoved: () => void;
}

/**
 * Eliminar deja el inmueble cancelado: desaparece de la búsqueda y de esta
 * lista, pero sus reservas pasadas y reseñas se conservan. El backend no deja
 * hacerlo mientras haya reservas vigentes.
 */
export default function ModalRemove({
  isOpen,
  onClose,
  hollidayId,
  hollidayName,
  onRemoved,
}: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [error, setError] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: () => removeHolliday(conjuntoId, String(hollidayId)),
    onSuccess: () => {
      onRemoved();
      onClose();
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "No se pudo eliminar"),
  });

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen, hollidayId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar propiedad">
      <Text size="sm" className="mb-2 text-slate-700">
        ¿Seguro que quieres eliminar{" "}
        <strong>{hollidayName || "este inmueble"}</strong>?
      </Text>
      <Text size="xs" className="mb-4 text-slate-500">
        Dejará de aparecer en la búsqueda y en tu lista. Las reservas pasadas y
        las reseñas se conservan. Si tiene reservas vigentes, primero cancélalas
        desde “Reservas”.
      </Text>

      {error && (
        <Text size="sm" className="mb-3 text-red-600">
          {error}
        </Text>
      )}

      <div className="flex justify-end gap-3">
        <Button onClick={onClose} disabled={remove.isPending} rounded="md">
          No, volver
        </Button>
        <Button
          colVariant="danger"
          onClick={() => remove.mutate()}
          disabled={remove.isPending || !hollidayId}
        >
          {remove.isPending ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </div>
    </Modal>
  );
}
