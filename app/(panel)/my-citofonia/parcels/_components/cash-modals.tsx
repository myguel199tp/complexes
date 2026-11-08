"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "complexes-next-components";
import { modal } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ExpectedParcel,
  getParcelResidents,
  money,
  ParcelCashRow,
  ParcelResident,
  parcelUnit,
  receiveCash,
  returnCash,
} from "../../services/parcelService";
import ResidentPicker from "./resident-picker";

/** El tope del backend: más que esto es un error de digitación. */
const MAX_AMOUNT = 5_000_000;

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["parcel-cash"] });
  queryClient.invalidateQueries({ queryKey: ["parcel-expected"] });
};

/**
 * Portería recibe plata de un residente para pagar un contraentrega. Queda a
 * nombre de quien la recibe y la unidad lo confirma desde la app.
 */
export function ReceiveCashModal({
  isOpen,
  conjuntoId,
  expected,
  onClose,
}: {
  isOpen: boolean;
  conjuntoId: string;
  /** Si viene de un paquete que la unidad ya avisó. */
  expected: ExpectedParcel | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [resident, setResident] = useState<ParcelResident | null>(null);
  const [amount, setAmount] = useState("");
  const [carrier, setCarrier] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setResident(null);
    setAmount("");
    setCarrier("");
    setDescription("");
    setError(null);
  }, [isOpen]);

  const { data: residents = [], isLoading, isError } = useQuery({
    queryKey: ["parcel-residents", conjuntoId],
    queryFn: () => getParcelResidents(conjuntoId),
    enabled: isOpen && !expected && !!conjuntoId,
  });

  const value = Number(amount);
  const validAmount = Number.isInteger(value) && value > 0 && value <= MAX_AMOUNT;
  const ready = validAmount && (Boolean(expected) || Boolean(resident));

  const mutation = useMutation({
    mutationFn: () =>
      receiveCash(
        conjuntoId,
        expected
          ? { expectedId: expected.id, amount: value }
          : {
              apartment: resident!.apartment,
              tower: resident!.tower ?? undefined,
              carrier: carrier.trim() || undefined,
              description: description.trim() || undefined,
              amount: value,
            },
      ),
    onSuccess: () => {
      showAlert("Quedó registrado a tu nombre. La unidad lo confirma en la app.", "success");
      invalidate(queryClient);
      onClose();
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Modal
      isOpen={isOpen}
      title="Recibir dinero de un residente"
      className={expected ? undefined : "w-11/12 max-w-4xl"}
      onClose={onClose}
    >
      <form
        className="flex max-h-[78vh] flex-col gap-3 overflow-y-auto p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) mutation.mutate();
        }}
      >
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className={expected ? "" : "grid gap-4 md:grid-cols-2"}>
          {expected ? (
            <p className={modal.text}>
              <strong className={modal.strong}>{parcelUnit(expected)}</strong>
              {" · "}
              {[expected.carrier, expected.description].filter(Boolean).join(" · ") ||
                "Paquete esperado"}
            </p>
          ) : (
            <ResidentPicker
              residents={residents}
              isLoading={isLoading}
              isError={isError}
              selectedId={resident?.id ?? null}
              onSelect={setResident}
            />
          )}

          <div className="flex flex-col gap-3">
            {!expected && (
              <>
                <p className={modal.text}>
                  {resident ? (
                    <strong className={modal.strong}>{parcelUnit(resident)}</strong>
                  ) : (
                    "Escoge al residente que deja el dinero."
                  )}
                </p>
                <label>
                  <span className={modal.label}>Transportadora o tienda</span>
                  <input
                    className={modal.input}
                    value={carrier}
                    maxLength={80}
                    onChange={(event) => setCarrier(event.target.value)}
                  />
                </label>
                <label>
                  <span className={modal.label}>¿Qué paquete es?</span>
                  <input
                    className={modal.input}
                    value={description}
                    maxLength={200}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
              </>
            )}

            <label>
              <span className={modal.label}>¿Cuánto dinero recibiste? *</span>
              <input
                className={modal.input}
                type="number"
                min={1}
                max={MAX_AMOUNT}
                step={1}
                inputMode="numeric"
                value={amount}
                autoFocus={Boolean(expected)}
                placeholder="50000"
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            {validAmount && <p className={modal.muted}>{money(value)}</p>}

            <p className={modal.muted}>
              Queda a tu nombre: respondes por esta plata hasta que la pagues a la
              transportadora o la devuelvas. A la unidad le llega el aviso para
              confirmarlo.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" rounded="md" colVariant="warning" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="submit"
            size="sm"
            rounded="md"
            colVariant="success"
            disabled={!ready || mutation.isPending}
          >
            Registrar dinero
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Devolver lo que queda: las vueltas, o todo si el paquete no llegó. */
export function ReturnCashModal({
  cash,
  conjuntoId,
  onClose,
}: {
  cash: ParcelCashRow | null;
  conjuntoId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName("");
    setError(null);
  }, [cash]);

  const mutation = useMutation({
    mutationFn: () => returnCash(conjuntoId, cash!.id, name.trim()),
    onSuccess: () => {
      showAlert("Devolución registrada. La unidad la confirma en la app.", "success");
      invalidate(queryClient);
      onClose();
    },
    onError: (e: Error) => {
      invalidate(queryClient);
      setError(e.message);
    },
  });

  return (
    <Modal isOpen={Boolean(cash)} title="Devolver dinero" onClose={onClose}>
      <form
        className="flex flex-col gap-3 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) mutation.mutate();
        }}
      >
        {cash && (
          <p className={modal.text}>
            <strong className={modal.strong}>{parcelUnit(cash)}</strong>
            {` · se devuelven ${money(cash.held)}`}
            {cash.paidAmount != null
              ? ` (vueltas de ${money(cash.amount)} menos ${money(cash.paidAmount)} pagados)`
              : ""}
          </p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <label>
          <span className={modal.label}>¿A quién se lo entregas?</span>
          <input
            className={modal.input}
            value={name}
            maxLength={120}
            autoFocus
            placeholder="Nombre completo"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" rounded="md" colVariant="warning" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="submit"
            size="sm"
            rounded="md"
            colVariant="primary"
            disabled={!name.trim() || mutation.isPending}
          >
            Registrar devolución
          </Button>
        </div>
      </form>
    </Modal>
  );
}
