"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Text, TextAreaField } from "complexes-next-components";
import { VisitResponse } from "../../services/response/VisitResponse";
import { ParkingDueError } from "../../services/citofonieExitService";
import { useExitVisitMutation } from "./use-exit-visit-mutation";
import {
  useParkingQr,
  usePayCashMutation,
  useStartCheckout,
} from "./use-parking-charge";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

/** Sin saldo que retenga el vehículo. */
const SETTLED = ["PAID", "REVIEW", "FREE"];

type Step = "confirm" | "charge" | "override";

interface Props {
  visit: VisitResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Cobro y salida del visitante.
 *
 * Antes esto era un "¿seguro que deseas cerrar la visita?" y nada más: el cobro
 * del parqueadero le quedaba colgado al residente, que no había manejado el
 * carro. Ahora paga quien se lo lleva, y por eso la salida deja de ser un botón
 * de confirmación para volverse el momento del cobro.
 *
 * El celador nunca elige el paso: el modal abre en la confirmación de siempre y
 * solo muestra el cobro si el backend responde que hay saldo. Para el visitante
 * a pie —la mayoría— la pantalla no cambió.
 */
export default function ParkingChargeModal({ visit, isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [due, setDue] = useState<ParkingDueError | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const { mutate: exitVisit, isPending: isExiting } = useExitVisitMutation();
  const { mutate: startCheckout, isPending: isOpeningCharge } =
    useStartCheckout();
  const { mutate: payCash, isPending: isPayingCash } = usePayCashMutation();

  const qrUrl = useParkingQr(visit?.id, showQr);

  /**
   * `visit` llega del listado que se refresca solo cada 5s, así que cuando el
   * visitante paga por QR el estado cambia acá sin que el celador toque nada:
   * es lo que le dice que ya puede abrir la reja.
   */
  const isSettled = visit ? SETTLED.includes(visit.paymentStatus) : false;

  // Cada visita abre limpia: el saldo y el motivo de la anterior no se heredan.
  useEffect(() => {
    if (!isOpen) return;

    setStep("confirm");
    setDue(null);
    setReason("");
    setError(null);
    setShowQr(false);
  }, [isOpen, visit?.id]);

  // Pagó mientras el modal estaba abierto: se vuelve a la confirmación, ya sin
  // saldo que retenga el carro.
  useEffect(() => {
    if (step === "charge" && isSettled) {
      setStep("confirm");
      setDue(null);
    }
  }, [step, isSettled]);

  if (!visit) return null;

  const handleExit = (overrideReason?: string) => {
    setError(null);

    exitVisit(
      { id: visit.id, overrideReason },
      {
        onSuccess: () => onClose(),
        onError: (err) => {
          // No es una falla: el visitante debe el parqueadero.
          if (err instanceof ParkingDueError) {
            setDue(err);
            setStep("charge");
            return;
          }

          setError(err instanceof Error ? err.message : "Error inesperado");
        },
      },
    );
  };

  const handleShowQr = () => {
    setError(null);

    startCheckout(visit.id, {
      onSuccess: () => setShowQr(true),
      onError: (err) => setError(err.message),
    });
  };

  const handleCash = (file: File) => {
    setError(null);

    payCash(
      { visitId: visit.id, file },
      {
        // El efectivo ya está en manos del celador: la salida se libera de una,
        // aunque administración todavía tenga que cuadrar caja.
        onSuccess: () => setStep("confirm"),
        onError: (err) => setError(err.message),
      },
    );
  };

  const amount = due?.amountDue ?? visit.parkingAmount ?? 0;

  return (
    <Modal isOpen={isOpen} title="Salida del visitante" onClose={onClose}>
      <div className="p-6">
        <Text className="mb-4">
          <strong>{visit.namevisit}</strong> — Apto {visit.apartment}
          {visit.plaque ? ` — ${visit.plaque}` : ""}
        </Text>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── Confirmación de salida ── */}
        {step === "confirm" && (
          <>
            {visit.hasParking && isSettled && (
              <div className="mb-4 rounded-md bg-emerald-50 p-3">
                <Text size="sm" className="text-emerald-700">
                  {visit.paymentStatus === "PAID"
                    ? "✅ Parqueadero pagado"
                    : visit.paymentStatus === "REVIEW"
                      ? "💵 Efectivo recibido — en revisión de administración"
                      : "Sin cobro de parqueadero"}
                </Text>
              </div>
            )}

            <Text className="mb-6">¿Registrar la salida y liberar la celda?</Text>

            <div className="flex justify-end gap-3">
              <Button onClick={onClose}>Cancelar</Button>

              <Button
                colVariant="success"
                disabled={isExiting}
                onClick={() => handleExit()}
              >
                {isExiting ? "Cerrando..." : "Registrar salida"}
              </Button>
            </div>
          </>
        )}

        {/* ── Cobro pendiente ── */}
        {step === "charge" && (
          <>
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <Text size="sm" className="text-amber-800">
                El visitante debe pagar antes de salir
              </Text>
              <Text size="lg" font="bold" className="mt-1">
                {money(amount)}
              </Text>
              {due && (
                <Text size="sm" className="text-gray-600">
                  {Math.floor(due.durationMinutes / 60)}h{" "}
                  {due.durationMinutes % 60}m de parqueadero
                </Text>
              )}
            </div>

            {showQr && (
              <div className="mb-4 flex flex-col items-center rounded-lg bg-white p-4">
                {qrUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="QR de pago del parqueadero"
                      className="h-56 w-56"
                    />
                    <Text size="sm" className="mt-2 text-center text-gray-600">
                      Que el visitante lo escanee con la cámara de su celular.
                      El pago aparece aquí solo.
                    </Text>
                  </>
                ) : (
                  <Text size="sm">Generando QR...</Text>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {!showQr && (
                <Button
                  colVariant="primary"
                  disabled={isOpeningCharge}
                  onClick={handleShowQr}
                >
                  {isOpeningCharge ? "Generando..." : "Cobrar con QR"}
                </Button>
              )}

              <Button
                colVariant="success"
                disabled={isPayingCash}
                onClick={() => fileRef.current?.click()}
              >
                {isPayingCash
                  ? "Registrando..."
                  : "Pagó en efectivo — subir soporte"}
              </Button>

              {/*
                El soporte es obligatorio, así que el botón de efectivo abre
                directamente la cámara: sin foto no hay registro del efectivo.
              */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCash(file);
                  e.target.value = "";
                }}
              />

              <Button colVariant="warning" onClick={() => setStep("override")}>
                Autorizar salida sin pago
              </Button>

              <Button onClick={onClose}>Cancelar</Button>
            </div>
          </>
        )}

        {/* ── Salida autorizada sin pago ── */}
        {step === "override" && (
          <>
            <Text size="sm" className="mb-3 text-gray-600">
              La deuda de {money(amount)} no se borra: queda en el listado de
              pendientes con tu nombre y este motivo.
            </Text>

            <TextAreaField
              placeholder="¿Por qué se autoriza la salida sin pago?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-4 w-full"
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <Button onClick={() => setStep("charge")}>Volver</Button>

              <Button
                colVariant="warning"
                disabled={isExiting || reason.trim().length < 5}
                onClick={() => handleExit(reason.trim())}
              >
                {isExiting ? "Cerrando..." : "Autorizar y dar salida"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
