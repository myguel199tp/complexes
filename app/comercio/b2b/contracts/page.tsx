"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useB2bAccess } from "../../_lib/use-b2b-access";
import { B2B_ACCESS_STATUS_KEY } from "../services/b2bAccessService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bContractStatus,
  confirmB2bContract,
  getB2bContracts,
  rejectB2bContract,
} from "../services/b2bContractsService";
import {
  SUSPEND_REASON_MIN,
  suspendB2bContract,
} from "../services/b2bInvoicesService";

const STATUS_LABELS: Record<B2bContractStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  suspended: "Suspendido por mora",
};

const STATUS_COLORS: Record<B2bContractStatus, string> = {
  pending: "text-amber-400",
  active: "text-emerald-400",
  rejected: "text-red-400",
  cancelled: "text-slate-500",
  suspended: "text-orange-400",
};

const FILTERS: { value: B2bContractStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "active", label: "Activos" },
  { value: "suspended", label: "Suspendidos" },
  { value: "rejected", label: "Rechazados" },
  { value: "cancelled", label: "Cancelados" },
];

export default function ComercioB2bContractsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [filter, setFilter] = useState<B2bContractStatus | "all">("all");
  // Contrato sobre el que se está escribiendo el motivo de suspensión.
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  useComercioGuard(() => router.push("/comercio/login"));

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["comercio_b2b_contracts", filter],
    queryFn: () =>
      getB2bContracts(filter === "all" ? undefined : filter),
  });

  const { limits, remaining, can } = useB2bAccess();

  // Confirmar un contrato consume cupo del plan de acceso; rechazar y
  // suspender no, así que sólo se bloquea "Confirmar".
  const contractsLeft = remaining("activeContracts");
  const atContractLimit = contractsLeft !== null && contractsLeft <= 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_contracts"] });
    // El cupo consumido viaja dentro del estado de acceso.
    queryClient.invalidateQueries({ queryKey: B2B_ACCESS_STATUS_KEY });
  };

  const confirmMut = useMutation({
    mutationFn: (id: string) => confirmB2bContract(id),
    onSuccess: () => {
      showAlert("Contrato confirmado", "success");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectB2bContract(id),
    onSuccess: () => {
      showAlert("Contrato rechazado", "success");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const suspendMut = useMutation({
    mutationFn: (id: string) => suspendB2bContract(id, suspendReason.trim()),
    onSuccess: () => {
      showAlert("Servicio suspendido", "success");
      setSuspendingId(null);
      setSuspendReason("");
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Contratos
          </Title>
          <div className="flex items-center gap-4">
            {can("invoicing") && (
              <Link
                href="/comercio/b2b/invoices"
                className="text-cyan-400 text-sm hover:text-cyan-300"
              >
                Facturación →
              </Link>
            )}
            <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
              ← Volver
            </Link>
          </div>
        </div>

        {limits?.maxActiveContracts != null && (
          <Text
            size="sm"
            className={`mt-2 ${
              atContractLimit ? "text-amber-300" : "text-slate-400"
            }`}
          >
            {(limits.maxActiveContracts ?? 0) - (contractsLeft ?? 0)} de{" "}
            {limits.maxActiveContracts} contratos activos de tu plan de acceso
            {atContractLimit
              ? " · llegaste al tope: mejora tu plan para aceptar más."
              : ` · te quedan ${contractsLeft}.`}
          </Text>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                filter === f.value
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "text-slate-400 border-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3">
          {isLoading ? (
            <Text size="sm" className="text-slate-400">Cargando...</Text>
          ) : contracts && contracts.length > 0 ? (
            contracts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Text size="sm" font="semi" className="text-slate-100">
                      {c.planName}{" "}
                      <span
                        className={`ml-2 text-xs ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                    </Text>
                    <Text size="xs" className="text-slate-400">
                      Conjunto: {c.conjunto?.name ?? c.conjuntoId}
                      {c.conjunto?.city ? ` · ${c.conjunto.city}` : ""}
                    </Text>
                    <Text size="sm" className="text-slate-300 mt-1">
                      {c.amount} {c.currency} / {c.billingPeriod}
                      {c.pricingModel === "por_apartamento" && c.quantityapt
                        ? ` (${c.quantityapt} apt)`
                        : ""}
                    </Text>
                    {c.nextPaymentDate && c.status === "active" ? (
                      <Text size="xs" className="text-slate-500 mt-1">
                        Próxima facturación:{" "}
                        {new Date(c.nextPaymentDate).toLocaleDateString("es-CO")}
                      </Text>
                    ) : null}
                    {/* La deuda va junto al contrato y no escondida en la
                        pestaña de facturas: es lo que decide si hay que llamar
                        a este conjunto hoy. */}
                    {c.outstanding && c.outstanding.amount > 0 ? (
                      <Text
                        size="xs"
                        className={
                          c.outstanding.overdueAmount > 0
                            ? "text-red-400 mt-1"
                            : "text-slate-400 mt-1"
                        }
                      >
                        Debe {c.outstanding.amount.toLocaleString("es-CO")}{" "}
                        {c.currency} en {c.outstanding.count} factura
                        {c.outstanding.count === 1 ? "" : "s"}
                        {c.outstanding.overdueAmount > 0
                          ? ` · ${c.outstanding.overdueAmount.toLocaleString("es-CO")} vencidos hace ${c.outstanding.daysOverdue} día${c.outstanding.daysOverdue === 1 ? "" : "s"}`
                          : " · todo dentro de plazo"}
                      </Text>
                    ) : null}
                    {c.status === "suspended" && c.suspensionReason ? (
                      <Text size="xs" className="text-orange-400/80 mt-1">
                        Suspendido: {c.suspensionReason}
                      </Text>
                    ) : null}
                    {c.notes ? (
                      <Text size="xs" className="text-slate-500 mt-1">
                        Nota: {c.notes}
                      </Text>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {c.status === "pending" ? (
                      <>
                        <Button
                          colVariant="success"
                          size="xs"
                          rounded="md"
                          onClick={() => confirmMut.mutate(c.id)}
                          disabled={atContractLimit}
                          title={
                            atContractLimit
                              ? "Llegaste al tope de contratos activos de tu plan"
                              : undefined
                          }
                        >
                          Confirmar
                        </Button>
                        <Button
                          colVariant="danger"
                          size="xs"
                          rounded="md"
                          onClick={() => rejectMut.mutate(c.id)}
                        >
                          Rechazar
                        </Button>
                      </>
                    ) : null}
                    {c.status === "active" ? (
                      <Button
                        colVariant="danger"
                        size="xs"
                        rounded="md"
                        onClick={() => {
                          setSuspendingId(
                            suspendingId === c.id ? null : c.id,
                          );
                          setSuspendReason("");
                        }}
                      >
                        {suspendingId === c.id ? "Cancelar" : "Suspender"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {suspendingId === c.id ? (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <Text size="xs" className="text-slate-400">
                      Solo puedes suspender si el conjunto tiene facturas
                      vencidas. El motivo le llega por correo.
                    </Text>
                    <textarea
                      className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
                      rows={2}
                      placeholder={`Motivo (mínimo ${SUSPEND_REASON_MIN} caracteres)`}
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`text-xs ${
                          suspendReason.trim().length >= SUSPEND_REASON_MIN
                            ? "text-slate-500"
                            : "text-amber-400"
                        }`}
                      >
                        {suspendReason.trim().length}/{SUSPEND_REASON_MIN}
                      </span>
                      <Button
                        colVariant="danger"
                        size="sm"
                        rounded="md"
                        onClick={() => suspendMut.mutate(c.id)}
                        disabled={
                          suspendMut.isLoading ||
                          suspendReason.trim().length < SUSPEND_REASON_MIN
                        }
                      >
                        {suspendMut.isLoading
                          ? "Suspendiendo..."
                          : "Suspender servicio"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <Text size="sm" className="text-slate-400">No hay contratos.</Text>
          )}
        </div>
      </div>
    </div>
  );
}
