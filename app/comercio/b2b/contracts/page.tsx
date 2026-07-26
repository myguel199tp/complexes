"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title } from "complexes-next-components";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bContractStatus,
  confirmB2bContract,
  getB2bContracts,
  rejectB2bContract,
} from "../services/b2bContractsService";

const STATUS_LABELS: Record<B2bContractStatus, string> = {
  pending: "Pendiente",
  active: "Activo",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<B2bContractStatus, string> = {
  pending: "text-amber-400",
  active: "text-emerald-400",
  rejected: "text-red-400",
  cancelled: "text-slate-500",
};

const FILTERS: { value: B2bContractStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "active", label: "Activos" },
  { value: "rejected", label: "Rechazados" },
  { value: "cancelled", label: "Cancelados" },
];

export default function ComercioB2bContractsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [filter, setFilter] = useState<B2bContractStatus | "all">("all");

  useComercioGuard(() => router.push("/comercio/login"));

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["comercio_b2b_contracts", filter],
    queryFn: () =>
      getB2bContracts(filter === "all" ? undefined : filter),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["comercio_b2b_contracts"] });

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

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Contratos
          </Title>
          <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
            ← Volver
          </Link>
        </div>

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
            <p className="text-slate-400 text-sm">Cargando...</p>
          ) : contracts && contracts.length > 0 ? (
            contracts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex justify-between gap-3"
              >
                <div>
                  <p className="text-slate-100 font-semibold">
                    {c.planName}{" "}
                    <span className={`ml-2 text-xs ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </p>
                  <p className="text-slate-400 text-xs">
                    Conjunto: {c.conjunto?.name ?? c.conjuntoId}
                    {c.conjunto?.city ? ` · ${c.conjunto.city}` : ""}
                  </p>
                  <p className="text-slate-300 text-sm mt-1">
                    {c.amount} {c.currency} / {c.billingPeriod}
                    {c.pricingModel === "por_apartamento" && c.quantityapt
                      ? ` (${c.quantityapt} apt)`
                      : ""}
                  </p>
                  {c.notes ? (
                    <p className="text-slate-500 text-xs mt-1">
                      Nota: {c.notes}
                    </p>
                  ) : null}
                </div>
                {c.status === "pending" ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      colVariant="success"
                      size="xs"
                      rounded="md"
                      onClick={() => confirmMut.mutate(c.id)}
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
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm">No hay contratos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
