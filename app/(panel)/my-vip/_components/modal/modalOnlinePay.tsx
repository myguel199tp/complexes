import React, { useEffect, useMemo, useState } from "react";
import { Modal, Text, Button } from "complexes-next-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  AdminFeeResponse,
  isOverdueFee,
  outstandingOf,
} from "@/app/(panel)/my-vip/services/response/adminfeesResponse";
import {
  cancelOnlinePayment,
  confirmOnlinePayment,
  OnlinePayment,
  OnlinePaymentStatus,
  quoteOnlinePayment,
  resendOnlinePaymentOtp,
  startOnlinePayment,
} from "../../services/onlinePaymentService";

type Step = "select" | "otp" | "done";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Cuotas y multas que todavía admiten pago (sin las que están en revisión). */
  fees: AdminFeeResponse[];
  status: OnlinePaymentStatus;
}

const currency = (value: number | string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const percent = (fraction: number) =>
  `${(fraction * 100).toFixed(2).replace(/\.?0+$/, "")} %`;

const ACCOUNT_TYPE: Record<string, string> = {
  SAVINGS: "ahorros",
  CHECKING: "corriente",
};

/**
 * Pago de cuotas en línea, solo para el propietario.
 *
 * Tres pasos: elegir qué paga y ver el desglose —la comisión va encima y se
 * dice antes de pedir el código, no después—, escribir el código que llega al
 * correo, y el resultado con los recibos. Sin el código no se cobra: una sesión
 * abierta en un computador ajeno no alcanza para mover plata.
 */
export default function ModalOnlinePay({
  isOpen,
  onClose,
  fees,
  status,
}: Props) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [payment, setPayment] = useState<OnlinePayment | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const sortedFees = useMemo(
    () =>
      [...fees].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      ),
    [fees],
  );

  // Al abrir se propone todo lo vencido: es lo que el propietario viene a pagar.
  useEffect(() => {
    if (!isOpen) return;

    setStep("select");
    setPayment(null);
    setOtp("");
    setError(null);
    setSelected(sortedFees.filter(isOverdueFee).map((fee) => fee.id));
    // Solo al abrir: con el modal abierto manda lo que el usuario marque.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reloj para la cuenta regresiva del reenvío.
  useEffect(() => {
    if (step !== "otp") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);

  const selectionKey = [...selected].sort().join(",");

  const quote = useQuery({
    queryKey: ["online-payment-quote", conjuntoId, selectionKey],
    queryFn: () => quoteOnlinePayment(conjuntoId, selectionKey.split(",")),
    enabled: isOpen && step === "select" && selected.length > 0 && !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const start = useMutation({
    mutationFn: () => startOnlinePayment(conjuntoId, selected),
    onSuccess: (created) => {
      setPayment(created);
      setOtp("");
      setError(null);
      setStep("otp");
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "No se pudo iniciar el pago"),
  });

  const resend = useMutation({
    mutationFn: () => resendOnlinePaymentOtp(conjuntoId, payment!.id),
    onSuccess: (updated) => {
      setPayment(updated);
      setError(null);
      showAlert("Te enviamos un código nuevo", "success");
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "No se pudo reenviar el código"),
  });

  const confirm = useMutation({
    mutationFn: () => confirmOnlinePayment(conjuntoId, payment!.id, otp),
    onSuccess: (paid) => {
      setPayment(paid);
      setError(null);
      setStep("done");

      queryClient.invalidateQueries({ queryKey: ["my-fees"] });
      queryClient.invalidateQueries({ queryKey: ["my-fees-this-month"] });
      queryClient.invalidateQueries({ queryKey: ["my-fines"] });
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : "No se pudo confirmar el pago");
      setOtp("");
    },
  });

  /** Abandonar el código cancela el pago: no queda uno vivo esperando. */
  const leaveOtpStep = () => {
    if (payment && step === "otp") {
      cancelOnlinePayment(conjuntoId, payment.id).catch(() => undefined);
    }
  };

  const handleClose = () => {
    leaveOtpStep();
    onClose();
  };

  const backToSelect = () => {
    leaveOtpStep();
    setPayment(null);
    setOtp("");
    setError(null);
    setStep("select");
  };

  const toggle = (id: string) => {
    setError(null);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const allSelected = selected.length === sortedFees.length;

  const toggleAll = () => {
    setError(null);
    setSelected(allSelected ? [] : sortedFees.map((fee) => fee.id));
  };

  const resendWait = payment?.canResendAt
    ? Math.max(0, Math.ceil((new Date(payment.canResendAt).getTime() - now) / 1000))
    : 0;

  const destination = payment?.destination ?? status.destination;
  const breakdown = step === "select" ? quote.data : payment;

  const isFailed =
    payment && ["FAILED", "EXPIRED", "CANCELLED"].includes(payment.status);

  return (
    <Modal
      isOpen={isOpen}
      title="Pagar en línea"
      onClose={handleClose}
      className="w-[95%] max-w-3xl max-h-[90vh]"
    >
      <div className="overflow-y-auto max-h-[80vh] p-2 space-y-4">
        {status.simulated && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Text size="sm" className="text-blue-800">
              Modo de prueba: todavía no hay pasarela de pagos conectada. El
              pago no mueve dinero real y el recibo sale marcado como simulado.
            </Text>
          </div>
        )}

        {step === "select" && (
          <>
            {sortedFees.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <Text size="sm" className="text-green-700">
                  🟢 No tienes cuotas por pagar.
                </Text>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                  <Text size="sm" font="bold" className="text-gray-800">
                    ¿Qué vas a pagar?
                  </Text>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {allSelected ? "Quitar todo" : "Seleccionar todo"}
                  </button>
                </div>

                <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
                  {sortedFees.map((fee) => {
                    const overdue = isOverdueFee(fee);

                    return (
                      <li key={fee.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-emerald-600"
                            checked={selected.includes(fee.id)}
                            onChange={() => toggle(fee.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-gray-800">
                              {fee.customName ?? fee.type}
                            </p>
                            <p
                              className={`text-xs ${overdue ? "text-red-600" : "text-gray-500"}`}
                            >
                              {overdue ? "Venció" : "Vence"} {shortDate(fee.dueDate)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {currency(outstandingOf(fee))}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {selected.length > 0 && quote.isLoading && (
              <Text size="sm" className="text-gray-500">
                Calculando…
              </Text>
            )}

            {quote.error && (
              <Text size="sm" colVariant="danger">
                {quote.error instanceof Error
                  ? quote.error.message
                  : "No se pudo calcular el pago"}
              </Text>
            )}
          </>
        )}

        {step === "otp" && payment && (
          <div className="space-y-3 rounded-xl border border-gray-200 p-4">
            <Text size="sm" className="text-gray-700">
              Te enviamos un código de 6 dígitos a{" "}
              <b className="text-gray-900">{payment.email}</b>. Escríbelo para
              pagar <b className="text-gray-900">{currency(payment.total)}</b>.
              Vence en 5 minutos.
            </Text>

            <input
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setError(null);
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otp.length === 6 && !confirm.isPending) {
                  confirm.mutate();
                }
              }}
              placeholder="••••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 outline-none focus:border-emerald-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => resend.mutate()}
                disabled={resendWait > 0 || resend.isPending}
                className="text-xs font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              >
                {resendWait > 0
                  ? `Reenviar código en ${resendWait} s`
                  : "Reenviar código"}
              </button>

              <button
                type="button"
                onClick={backToSelect}
                className="text-xs font-semibold text-gray-600 hover:underline"
              >
                Cambiar lo que voy a pagar
              </button>
            </div>
          </div>
        )}

        {step === "done" && payment && (
          <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <Text font="bold" className="text-green-800">
              ✅ Pago aprobado
            </Text>
            <Text size="sm" className="text-gray-700">
              Pagaste {currency(payment.total)}. Tus cuotas ya quedaron al día y
              no tienes que subir comprobante.
            </Text>
            <Text size="xs" className="text-gray-600">
              Referencia {payment.gatewayReference}
            </Text>

            {(payment.receipts ?? []).length > 0 && (
              <ul className="divide-y divide-green-100 rounded-lg border border-green-100 bg-white">
                {payment.receipts!.map((receipt) => (
                  <li
                    key={receipt.installmentId}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <span className="text-sm text-gray-800">
                      {receipt.concept}
                      {receipt.receiptNumber && (
                        <span className="ml-2 text-xs text-gray-500">
                          Recibo {receipt.receiptNumber}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currency(receipt.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* DESGLOSE */}
        {breakdown && step !== "done" && (
          <div className="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Row label="Cuotas (van al conjunto)" value={currency(breakdown.amount)} />
            <Row
              label={`Costo de la transacción (${breakdown.feePercent} % + ${currency(breakdown.feeFixed)})`}
              value={currency(breakdown.commission)}
            />
            <Row
              label={`IVA del costo (${percent(breakdown.taxRate)})`}
              value={currency(breakdown.taxAmount)}
            />
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-bold text-gray-900">Total a pagar</span>
              <span className="text-lg font-bold text-gray-900">
                {currency(breakdown.total)}
              </span>
            </div>

            {destination && (
              <p className="pt-1 text-xs text-gray-500">
                Lo de las cuotas llega a la cuenta de{" "}
                {ACCOUNT_TYPE[destination.accountType] ?? "ahorros"}{" "}
                {destination.bankName} del conjunto terminada en{" "}
                {destination.accountLast4}. El costo de la transacción cubre la
                pasarela de pagos y lo cobra la plataforma.
              </p>
            )}
          </div>
        )}

        {(error || (isFailed && payment?.failureReason)) && (
          <Text size="sm" colVariant="danger">
            {error ?? payment?.failureReason}
          </Text>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          {step === "done" ? (
            <Button colVariant="success" size="sm" onClick={onClose}>
              Listo
            </Button>
          ) : (
            <>
              <Button colVariant="default" size="sm" onClick={handleClose}>
                Cancelar
              </Button>

              {step === "select" && (
                <Button
                  colVariant="success"
                  size="sm"
                  disabled={
                    selected.length === 0 || !quote.data || start.isPending
                  }
                  onClick={() => start.mutate()}
                >
                  {start.isPending
                    ? "Enviando código..."
                    : quote.data
                      ? `Continuar · ${currency(quote.data.total)}`
                      : "Continuar"}
                </Button>
              )}

              {step === "otp" && payment && (
                <Button
                  colVariant="success"
                  size="sm"
                  disabled={otp.length !== 6 || confirm.isPending || !!isFailed}
                  onClick={() => confirm.mutate()}
                >
                  {confirm.isPending
                    ? "Pagando..."
                    : `Pagar ${currency(payment.total)}`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
