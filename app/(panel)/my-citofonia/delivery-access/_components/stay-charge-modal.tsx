"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Buton, Modal, Text, TextAreaField } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";
import { GuestFeeDueError } from "../../services/stayChargeService";
import {
  isChargeSettled,
  usePayStayCash,
  useStartStayCheckout,
  useStayCharge,
  useStayQr,
  useWaiveStayCharge,
} from "./use-stay-charge";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

interface Props {
  due: GuestFeeDueError | null;
  isOpen: boolean;
  onClose: () => void;
  /** Se llama cuando el cobro queda saldado: la pantalla revalida el código. */
  onSettled: () => void;
}

/**
 * Cobro de acceso del huésped que llegó por una plataforma externa.
 *
 * Se abre solo cuando el backend responde 402 al validar el código. Para
 * cualquier otro visitante —residente, domicilio, huésped ya pagado— esta
 * pantalla no aparece y el celador no cambia nada de lo que hacía.
 *
 * El pago por QR no necesita que el celador confirme nada: el estado se
 * consulta en bucle y, cuando el huésped paga en su celular, el modal se cierra
 * solo y revalida el código. Eso es lo que le dice al celador que abra la reja.
 */
export default function StayChargeModal({
  due,
  isOpen,
  onClose,
  onSettled,
}: Props) {
  const stayId = due?.externalStayId;

  const [showQr, setShowQr] = useState(false);
  const [waiving, setWaiving] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const { data: charge } = useStayCharge(stayId, isOpen);
  const { mutate: openCharge, isPending: isOpening } = useStartStayCheckout();
  const { mutate: payCash, isPending: isPayingCash } = usePayStayCash();
  const { mutate: waive, isPending: isWaiving } = useWaiveStayCharge();

  const qrUrl = useStayQr(stayId, showQr);

  // Cada huésped abre limpio: el QR y el motivo del anterior no se heredan.
  useEffect(() => {
    if (!isOpen) return;

    setShowQr(false);
    setWaiving(false);
    setReason("");
    setError(null);
  }, [isOpen, stayId]);

  // Pagó mientras el modal estaba abierto.
  useEffect(() => {
    if (isOpen && isChargeSettled(charge)) onSettled();
  }, [isOpen, charge, onSettled]);

  if (!due) return null;

  const amount = charge?.amount ?? due.amountDue;

  const handleQr = () => {
    setError(null);

    openCharge(due.externalStayId, {
      onSuccess: () => setShowQr(true),
      onError: (err) => setError(err.message),
    });
  };

  const handleCash = (file: File) => {
    setError(null);

    payCash(
      { stayId: due.externalStayId, file },
      {
        onSuccess: () => onSettled(),
        onError: (err) => setError(err.message),
      },
    );
  };

  const handleWaive = () => {
    setError(null);

    waive(
      { stayId: due.externalStayId, reason },
      {
        onSuccess: () => onSettled(),
        onError: (err) => setError(err.message),
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cobro de acceso del huésped"
      className="w-full h-auto md:!w-[520px]"
    >
      <div className="p-2">
        <Text size="sm" className="text-gray-600">
          {due.message}
        </Text>

        <Text font="bold" className="mt-3 text-center text-4xl text-gray-800">
          {money(amount)}
        </Text>

        <Text size="xs" className="mt-1 text-center text-gray-500">
          Al pagar se le crea la cuenta y queda asociado al apartamento.
        </Text>

        {error && (
          <Text
            size="sm"
            colVariant="danger"
            className="mt-4 rounded-md bg-red-50 p-3 text-center"
          >
            {error}
          </Text>
        )}

        {/* ── Pago con QR ── */}
        {showQr && (
          <div className="mt-4 flex flex-col items-center">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="QR de pago del acceso"
                className="h-56 w-56 rounded-lg bg-white p-2"
              />
            ) : (
              <ImSpinner9 className="animate-spin text-cyan-800" size={32} />
            )}

            <Text size="xs" className="mt-2 text-center text-gray-500">
              Que el huésped lo escanee con la cámara. La pantalla se actualiza
              sola cuando pague.
            </Text>
          </div>
        )}

        {/* ── Exoneración ── */}
        {waiving ? (
          <div className="mt-4">
            <TextAreaField
              placeholder="¿Por qué se exonera este cobro?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="mt-3 flex gap-2 justify-end">
              <Buton borderWidth="none" onClick={() => setWaiving(false)}>
                Cancelar
              </Buton>
              <Button
                size="sm"
                colVariant="warning"
                disabled={!reason.trim() || isWaiving}
                onClick={handleWaive}
              >
                {isWaiving ? "Guardando..." : "Exonerar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Button size="sm" colVariant="success" disabled={isOpening} onClick={handleQr}>
              {isOpening ? "Generando..." : showQr ? "Regenerar QR" : "Mostrar QR"}
            </Button>

            <Button
              size="sm"
              disabled={isPayingCash}
              onClick={() => fileRef.current?.click()}
            >
              {isPayingCash ? "Guardando..." : "Recibí efectivo"}
            </Button>

            <Buton borderWidth="none" className="underline" onClick={() => setWaiving(true)}>
              Exonerar
            </Buton>
          </div>
        )}

        {/*
          El soporte del efectivo es obligatorio y por eso el botón abre el
          selector: no hay forma de registrar la plata sin adjuntar la prueba.
        */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCash(file);
            e.target.value = "";
          }}
        />
      </div>
    </Modal>
  );
}
