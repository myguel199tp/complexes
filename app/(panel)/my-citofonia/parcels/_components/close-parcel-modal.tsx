"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import { modal } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  CANCEL_KIND_LABEL,
  cancelParcel,
  deliverParcel,
  Parcel,
  ParcelCancelKind,
  parcelUnit,
} from "../../services/parcelService";

interface Props {
  /** El paquete y qué se va a hacer con él; sin esto el modal está cerrado. */
  closing: { parcel: Parcel; action: "deliver" | "cancel" } | null;
  conjuntoId: string;
  onClose: () => void;
}

/** Mínimo que exige el backend para el motivo. */
const MIN_REASON = 5;

const CANCEL_KINDS = Object.keys(CANCEL_KIND_LABEL) as ParcelCancelKind[];

const REASON_HINT: Record<ParcelCancelKind, string> = {
  ERROR: "Ej.: era de la otra torre",
  RETURNED: "Ej.: la dirección estaba mal y se lo llevó el mensajero",
  LOST: "Ej.: no aparece desde el cambio de turno de la noche",
};

export default function CloseParcelModal({
  closing,
  conjuntoId,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [reason, setReason] = useState("");
  const [kind, setKind] = useState<ParcelCancelKind>("ERROR");
  const [error, setError] = useState<string | null>(null);

  const parcel = closing?.parcel;
  const delivering = closing?.action === "deliver";

  useEffect(() => {
    // Quien viene por el paquete suele ser a quien va dirigido.
    setName(closing?.parcel.recipientName ?? "");
    setDocument("");
    setReason("");
    setKind("ERROR");
    setError(null);
  }, [closing]);

  const mutation = useMutation({
    mutationFn: () =>
      delivering
        ? deliverParcel(conjuntoId, parcel!.id, {
            deliveredToName: name.trim(),
            deliveredToDocument: document.trim() || undefined,
          })
        : cancelParcel(conjuntoId, parcel!.id, kind, reason.trim()),
    onSuccess: () => {
      showAlert(
        delivering ? "Paquete entregado" : "Paquete cerrado sin entregar",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      onClose();
    },
    onError: (e: Error) => {
      // Otro portero pudo cerrarlo mientras este modal estaba abierto.
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      setError(e.message);
    },
  });

  const ready = delivering
    ? Boolean(name.trim())
    : reason.trim().length >= MIN_REASON;

  return (
    <Modal
      isOpen={Boolean(closing)}
      title={delivering ? "Entregar paquete" : "Cerrar sin entregar"}
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-3 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) mutation.mutate();
        }}
      >
        {parcel && (
          <p className={modal.text}>
            <strong className={modal.strong}>{parcelUnit(parcel)}</strong>
            {parcel.carrier ? ` · ${parcel.carrier}` : ""}
          </p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {delivering ? (
          <>
            <label>
              <span className={modal.label}>¿Quién lo retira?</span>
              <input
                className={modal.input}
                value={name}
                maxLength={120}
                autoFocus
                placeholder="Nombre completo"
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              <span className={modal.label}>Documento (opcional)</span>
              <input
                className={modal.input}
                value={document}
                maxLength={40}
                onChange={(event) => setDocument(event.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              <span className={modal.label}>¿Qué pasó?</span>
              <select
                className={modal.input}
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as ParcelCancelKind)
                }
              >
                {CANCEL_KINDS.map((option) => (
                  <option key={option} value={option}>
                    {CANCEL_KIND_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={modal.label}>Cuéntalo en pocas palabras</span>
              <textarea
                className={modal.input}
                rows={3}
                value={reason}
                maxLength={300}
                autoFocus
                placeholder={REASON_HINT[kind]}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <p className={modal.muted}>
              A la unidad le llega el aviso
              {kind === "LOST" ? " y también a la administración" : ""}.
            </p>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            rounded="md"
            colVariant="warning"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="submit"
            size="sm"
            rounded="md"
            colVariant="primary"
            disabled={!ready || mutation.isPending}
          >
            {delivering ? "Marcar entregado" : "Cerrar paquete"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
