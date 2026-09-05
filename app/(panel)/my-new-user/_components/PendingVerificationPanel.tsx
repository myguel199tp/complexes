"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProofLink } from "@/app/(panel)/my-fees/_components/proof-link";
import {
  Badge,
  Button,
  InputField,
  Modal,
  Table,
  Text,
} from "complexes-next-components";
import { usePendingVerificationQuery } from "./use-pending-verification-query";
import { useMutationApproveAmount } from "./modal/aprovedMutation";
import { useMutationRejectPayment } from "./modal/rejectMutation";
import type { PendingVerificationFee } from "../services/verificationService";

const currency = (value: number | string) => {
  const amount = Number(value);

  if (isNaN(amount)) return String(value ?? "-");

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

const shortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "-";

/**
 * El comprobante ya no se enlaza contra el estático del backend: se pide por
 * `GET /admin-fee/:id/proof`, que valida quién pregunta. `ProofLink`
 * encapsula esa descarga autenticada.
 */

/**
 * Bandeja de verificación de comprobantes.
 *
 * `GET /admin-fee/pending-verification` existía en el backend pero no lo
 * consumía nadie: para encontrar un comprobante recién subido la administración
 * tenía que abrir residente por residente y revisar la pestaña "Pagos". Esta es
 * la lista única de lo que está esperando revisión.
 */
export default function PendingVerificationPanel() {
  const { data = [], isLoading, error } = usePendingVerificationQuery();
  const queryClient = useQueryClient();

  const approveMutation = useMutationApproveAmount();
  const rejectMutation = useMutationRejectPayment();

  const [open, setOpen] = useState(true);
  const [rejecting, setRejecting] = useState<PendingVerificationFee | null>(
    null,
  );
  const [reason, setReason] = useState("");

  /**
   * Al aprobar se confirma el monto contra el extracto. El residente reporta lo
   * que cree haber consignado y no siempre coincide; antes ese paso no existía
   * y la cuota se saldaba por el total.
   */
  const [approving, setApproving] = useState<PendingVerificationFee | null>(
    null,
  );
  const [approvedAmount, setApprovedAmount] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-fee-pending"] });
    queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
  };

  const openApprove = (fee: PendingVerificationFee) => {
    setApproving(fee);

    // Se propone lo que reportó el residente; si no reportó nada, el saldo.
    const suggested =
      Number(fee.reportedAmount) ||
      Number(fee.outstanding) ||
      Number(fee.amount);

    setApprovedAmount(String(suggested));
  };

  const closeApprove = () => {
    setApproving(null);
    setApprovedAmount("");
  };

  const confirmApprove = () => {
    const amount = Number(approvedAmount);

    if (!approving || isNaN(amount) || amount <= 0) return;

    approveMutation.mutate(
      { id: approving.id, amount },
      {
        onSuccess: () => {
          refresh();
          closeApprove();
        },
      },
    );
  };

  /**
   * El motivo de rechazo se pedía con un `prompt()` nativo, que además de
   * romper el diseño no permite un texto de varias líneas — y ese motivo es lo
   * único que el residente ve para saber qué corregir.
   */
  const closeReject = () => {
    setRejecting(null);
    setReason("");
  };

  const confirmReject = () => {
    if (!rejecting || !reason.trim()) return;

    rejectMutation.mutate(
      { id: rejecting.id, reason: reason.trim() },
      {
        onSuccess: () => {
          refresh();
          closeReject();
        },
      },
    );
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <Text size="sm" className="text-red-600">
          No se pudo cargar la bandeja de verificación: {String(error)}
        </Text>
      </div>
    );
  }

  const headers = [
    "Unidad",
    "Residente",
    "Concepto",
    "Cuota",
    "Saldo",
    "Reportado",
    "Vence",
    "Soporte",
    "Acciones",
  ];

  const busy = approveMutation.isPending || rejectMutation.isPending;

  const rows = data.map((fee) => {
    return [
      [fee.tower, fee.apartment].filter(Boolean).join(" - ") || "-",

      fee.user ?? "-",

      fee.customName || fee.type,

      currency(fee.amount),

      /*
        Saldo antes de este abono: sobre una cuota ya abonada, lo que falta no
        es el monto de la cuota.
      */
      currency(fee.outstanding ?? fee.amount),

      /*
        El residente reporta el valor que consignó y puede no coincidir con el
        saldo: verlos lado a lado es lo que permite detectar el abono parcial
        antes de aprobar por el total.
      */
      fee.reportedAmount
        ? currency(fee.reportedAmount)
        : fee.valuepay
          ? currency(fee.valuepay)
          : "-",

      shortDate(fee.dueDate),

      fee.file ? (
        <ProofLink
          key={`proof-${fee.id}`}
          feeId={fee.id}
          fallback={<span className="text-xs text-gray-400">Cargando…</span>}
        />
      ) : fee.paymentReference ? (
        <span key={`ref-${fee.id}`} className="font-mono text-xs">
          {fee.paymentReference}
        </span>
      ) : (
        "-"
      ),

      <div key={`actions-${fee.id}`} className="flex gap-2">
        <button
          onClick={() => openApprove(fee)}
          disabled={busy}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          onClick={() => setRejecting(fee)}
          disabled={busy}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>,
    ];
  });

  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2"
      >
        <Badge
          size="sm"
          colVariant={data.length > 0 ? "warning" : "primary"}
          rounded="lg"
        >
          Comprobantes por verificar
          {data.length > 0 ? ` (${data.length})` : ""} {open ? "▲" : "▼"}
        </Badge>
      </button>

      {open && (
        <div className="mt-3">
          {isLoading ? (
            <Text size="sm" className="text-gray-500">
              Cargando comprobantes...
            </Text>
          ) : data.length === 0 ? (
            <Text size="sm" className="text-gray-500">
              No hay comprobantes esperando verificación.
            </Text>
          ) : (
            <Table
              headers={headers}
              rows={rows}
              cellClasses={cellClasses}
              columnWidths={[
                "10%",
                "15%",
                "15%",
                "10%",
                "10%",
                "10%",
                "8%",
                "9%",
                "13%",
              ]}
            />
          )}
        </div>
      )}

      {/*
        Confirmar el monto contra el extracto. Sin este paso, aprobar marcaba la
        cuota pagada por el total: un abono de $50.000 sobre una cuota de
        $300.000 la dejaba saldada.
      */}
      <Modal
        isOpen={!!approving}
        onClose={closeApprove}
        title="Confirmar el pago"
      >
        <div className="flex flex-col gap-3 py-2">
          {approving && (
            <>
              <Text size="sm" className="text-gray-600">
                {approving.customName || approving.type} —{" "}
                {[approving.tower, approving.apartment]
                  .filter(Boolean)
                  .join(" - ") || "unidad sin identificar"}
              </Text>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-gray-50 p-3">
                  <Text size="xs" className="text-gray-500">
                    Saldo de la cuota
                  </Text>
                  <Text size="sm" font="bold">
                    {currency(approving.outstanding ?? approving.amount)}
                  </Text>
                </div>

                <div className="rounded-lg border bg-gray-50 p-3">
                  <Text size="xs" className="text-gray-500">
                    Reportado por el residente
                  </Text>
                  <Text size="sm" font="bold">
                    {approving.reportedAmount
                      ? currency(approving.reportedAmount)
                      : "No lo indicó"}
                  </Text>
                </div>
              </div>

              <div>
                <InputField
                  regexType="number"
                  type="number"
                  helpText="Monto verificado"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                  min={1}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                />
              </div>

              {/*
                Aviso explícito: es la diferencia entre saldar la cuota y
                dejarla abonada, y es la decisión que el administrador está
                tomando en este momento.
              */}
              {Number(approvedAmount) > 0 &&
                Number(approvedAmount) <
                  Number(approving.outstanding ?? approving.amount) && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <Text size="xs" className="text-yellow-800">
                      Es un abono parcial: la cuota queda con un saldo de{" "}
                      {currency(
                        Number(approving.outstanding ?? approving.amount) -
                          Number(approvedAmount),
                      )}{" "}
                      y sigue contando como deuda.
                    </Text>
                  </div>
                )}

              <div className="flex justify-end gap-2">
                <Button
                  colVariant="default"
                  rounded="md"
                  onClick={closeApprove}
                  disabled={approveMutation.isPending}
                >
                  Cancelar
                </Button>

                <Button
                  colVariant="success"
                  rounded="md"
                  onClick={confirmApprove}
                  disabled={
                    approveMutation.isPending ||
                    !(Number(approvedAmount) > 0)
                  }
                >
                  {approveMutation.isPending ? "Registrando..." : "Confirmar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!rejecting}
        onClose={closeReject}
        title="Rechazar comprobante"
      >
        <div className="flex flex-col gap-3 py-2">
          <Text size="sm" className="text-gray-600">
            {rejecting
              ? `${rejecting.customName || rejecting.type} — ${currency(
                  rejecting.amount,
                )} — ${
                  [rejecting.tower, rejecting.apartment]
                    .filter(Boolean)
                    .join(" - ") || "unidad sin identificar"
                }`
              : ""}
          </Text>

          <Text size="xs" className="text-gray-500">
            El residente verá este motivo y podrá volver a subir el comprobante.
          </Text>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Ej: el valor consignado no corresponde al de la cuota."
            className="w-full rounded-md border p-3 text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              rounded="md"
              onClick={closeReject}
              disabled={rejectMutation.isPending}
            >
              Cancelar
            </Button>

            <Button
              colVariant="danger"
              rounded="md"
              onClick={confirmReject}
              disabled={!reason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rechazando..." : "Rechazar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
