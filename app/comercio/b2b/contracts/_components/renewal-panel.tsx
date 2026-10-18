"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "complexes-next-components";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bContract,
  offerB2bRenewal,
  withdrawB2bRenewal,
} from "../../services/b2bContractsService";

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "";

const fmtMoney = (value: number) =>
  `$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

/**
 * Vigencia de un contrato visto por el proveedor, y su propuesta de
 * renovación. Se propone en los últimos 90 días: el conjunto la lleva a su
 * consejo o a su presidente, a veces junto con cotizaciones de otros.
 */
export function RenewalPanel({ contract }: { contract: B2bContract }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(contract.price ?? ""));
  const [termMonths, setTermMonths] = useState(String(contract.termMonths ?? 12));
  const [note, setNote] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [reason, setReason] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_contracts"] });

  const offerMut = useMutation({
    mutationFn: () =>
      offerB2bRenewal(contract.id, {
        price: Number(price),
        termMonths: Number(termMonths) || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      showAlert(
        "Propuesta enviada. El conjunto la llevará a decisión de su consejo o de su presidente.",
        "success",
      );
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const withdrawMut = useMutation({
    mutationFn: (id: string) => withdrawB2bRenewal(id, reason.trim()),
    onSuccess: () => {
      showAlert("Propuesta retirada.", "success");
      setWithdrawing(false);
      setReason("");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const offer = contract.renewalOffer;
  const days = contract.daysToEnd;
  const unitLabel =
    contract.pricingModel === "por_apartamento" ? "por apartamento" : "por periodo";

  return (
    <div className="mt-2 space-y-1">
      {contract.endDate && contract.status !== "expired" ? (
        <Text
          size="xs"
          className={days != null && days <= 30 ? "text-amber-300" : "text-slate-500"}
        >
          Vigente hasta el {fmtDate(contract.endDate)}
          {days != null && days > 0 ? ` (faltan ${days} días)` : ""}
        </Text>
      ) : null}

      {contract.status === "expired" ? (
        <Text size="xs" className="text-slate-400">
          Terminó el {fmtDate(contract.endDate)} sin renovarse.
        </Text>
      ) : null}

      {contract.needsEndDate ? (
        <Text size="xs" className="text-slate-500">
          Sin fecha de fin registrada: el conjunto debe registrarla para poder
          renovar.
        </Text>
      ) : null}

      {offer ? (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 space-y-1">
          <Text size="xs" className="text-cyan-100">
            Propusiste renovar por {offer.termMonths} meses a{" "}
            {fmtMoney(offer.amount)} por periodo ({offer.changePercent > 0 ? "+" : ""}
            {offer.changePercent}%).{" "}
            {offer.inDecision
              ? "El conjunto la está decidiendo."
              : "Esperando a que el conjunto la lleve a decisión."}
          </Text>
          {!offer.inDecision ? (
            withdrawing ? (
              <div className="space-y-1">
                <textarea
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-slate-200"
                  placeholder="¿Por qué la retiras?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    rounded="md"
                    colVariant="danger"
                    disabled={reason.trim().length < 10 || withdrawMut.isLoading}
                    onClick={() => withdrawMut.mutate(offer.id)}
                  >
                    Retirar
                  </Button>
                  <Button
                    size="xs"
                    rounded="md"
                    colVariant="default"
                    onClick={() => setWithdrawing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="xs"
                rounded="md"
                colVariant="default"
                onClick={() => setWithdrawing(true)}
              >
                Retirar propuesta
              </Button>
            )
          ) : null}
        </div>
      ) : contract.renewalWindowOpen ? (
        open ? (
          <div className="rounded-lg border border-white/10 p-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              <label className="text-xs text-slate-400">
                Precio {unitLabel}
                <input
                  type="number"
                  min={1}
                  className="block w-36 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-slate-200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="text-xs text-slate-400">
                Plazo (meses)
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="block w-24 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-slate-200"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                />
              </label>
            </div>
            <textarea
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm text-slate-200"
              placeholder="Qué cambia y por qué: reajuste por IPC, ajuste de alcance..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                size="xs"
                rounded="md"
                colVariant="success"
                disabled={!(Number(price) > 0) || offerMut.isLoading}
                onClick={() => offerMut.mutate()}
              >
                Enviar propuesta
              </Button>
              <Button size="xs" rounded="md" colVariant="default" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button size="xs" rounded="md" colVariant="primary" onClick={() => setOpen(true)}>
            Proponer renovación
          </Button>
        )
      ) : null}
    </div>
  );
}
