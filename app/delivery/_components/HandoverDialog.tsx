"use client";

import { useEffect, useState } from "react";
import { Button, Text } from "complexes-next-components";
import {
  DELIVERY_FAILURE_REASON_MIN,
  DELIVERY_OVERRIDE_REASON_MIN,
  DeliveryHandover,
} from "../services/deliveryOrdersService";

/**
 * Lo que pasa en la puerta: se entrega con el código, sin él, o no se entrega.
 *
 * - `deliver`: pide los cuatro dígitos que el cliente ve en su app. Debajo, y
 *   a un toque más, entregar sin código con una explicación: la puerta real no
 *   siempre responde, y un pedido que no se puede cerrar nunca es peor que uno
 *   cerrado con motivo.
 * - `fail`: no se pudo entregar. El pedido vuelve al comercio para que lo
 *   reasigne o lo cancele, así que el motivo es lo único que tiene para
 *   decidir.
 *
 * Es un solo componente porque las dos pantallas del repartidor —pedidos y
 * viajes— cierran entregas, y si cada una pidiera cosas distintas, una de las
 * dos sería la puerta de atrás.
 */
export default function HandoverDialog({
  mode,
  open,
  busy,
  error,
  onCancel,
  onDeliver,
  onFail,
}: {
  mode: "deliver" | "fail";
  open: boolean;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onDeliver?: (handover: DeliveryHandover) => void;
  onFail?: (reason: string) => void;
}) {
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const [showOverride, setShowOverride] = useState(false);

  // Cada apertura empieza limpia: el código del pedido anterior no sirve para
  // éste, y dejarlo escrito invita a mandarlo sin mirar.
  useEffect(() => {
    if (!open) return;
    setCode("");
    setReason("");
    setShowOverride(false);
  }, [open, mode]);

  if (!open) return null;

  const trimmed = reason.trim();
  const failing = mode === "fail";
  const reasonMin = failing
    ? DELIVERY_FAILURE_REASON_MIN
    : DELIVERY_OVERRIDE_REASON_MIN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
        <Text size="md" font="semi" className="text-slate-100">
          {failing ? "No pude entregar el pedido" : "Confirmar la entrega"}
        </Text>

        {failing ? (
          <>
            <Text size="sm" className="mt-1 text-slate-400">
              El pedido vuelve al comercio para que lo reasigne o lo cancele.
              Cuenta qué pasó: lo van a leer el comercio y el cliente.
            </Text>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
              placeholder="Ej: nadie abrió y el cliente no contesta el teléfono"
              className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none"
            />
            <Text size="xs" className="mt-1 text-right text-slate-500">
              {trimmed.length}/{reasonMin}
            </Text>
          </>
        ) : (
          <>
            <Text size="sm" className="mt-1 text-slate-400">
              Pídele al cliente el código de 4 dígitos que ve en su app.
            </Text>

            {/* Grande y espaciado: se teclea de pie, con una mano. */}
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="0000"
              maxLength={4}
              className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 py-3 text-center text-3xl font-bold tracking-[0.5em] text-slate-100 placeholder:text-slate-700 focus:border-emerald-400/60 focus:outline-none"
            />
          </>
        )}

        {error ? (
          <Text size="sm" colVariant="danger" className="mt-3">
            {error}
          </Text>
        ) : null}

        <div className="mt-4 grid gap-2">
          {failing ? (
            <Button
              colVariant="warning"
              size="md"
              rounded="md"
              disabled={busy || trimmed.length < reasonMin}
              onClick={() => onFail?.(trimmed)}
            >
              {busy ? "Enviando..." : "Devolver el pedido al comercio"}
            </Button>
          ) : (
            <>
              <Button
                colVariant="success"
                size="md"
                rounded="md"
                disabled={busy || code.length !== 4}
                onClick={() => onDeliver?.({ deliveryCode: code })}
              >
                {busy ? "Confirmando..." : "Confirmar entrega"}
              </Button>

              {showOverride ? (
                <div className="mt-2 border-t border-white/10 pt-3">
                  <Text size="sm" font="semi" className="text-slate-200">
                    Entregar sin código
                  </Text>
                  <Text size="xs" className="mt-1 text-slate-400">
                    Cuenta qué pasó. El cliente y el comercio van a ver esto.
                  </Text>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Ej: lo dejé en portería, el cliente no contestó"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400/60 focus:outline-none"
                  />
                  <Text size="xs" className="mt-1 text-right text-slate-500">
                    {trimmed.length}/{reasonMin}
                  </Text>
                  <Button
                    colVariant="danger"
                    size="md"
                    rounded="md"
                    className="mt-2 w-full"
                    disabled={busy || trimmed.length < reasonMin}
                    onClick={() => onDeliver?.({ overrideReason: trimmed })}
                  >
                    Entregar sin código
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="py-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                  onClick={() => setShowOverride(true)}
                >
                  El cliente no puede darme el código
                </button>
              )}
            </>
          )}

          <button
            type="button"
            className="py-2 text-sm text-slate-400 hover:text-slate-200"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
